import express from "express";
import cors from "cors";
import multer from "multer";
import ImageKit from "imagekit";
import { MongoClient } from "mongodb";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import dotenv from "dotenv"; 
dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("pdfchat");
const collection = db.collection("documents");
console.log("MongoDB Atlas connected");

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;

    const ikResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: "/pdfs",
    });
    const pdfUrl = ikResponse.url;
    console.log("PDF uploaded to ImageKit:", pdfUrl);

    const tempPath = join(tmpdir(), fileName);
    writeFileSync(tempPath, fileBuffer);

    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    unlinkSync(tempPath);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);

    // 5. Add metadata to each chunk
    chunks.forEach((chunk) => {
      chunk.metadata.pdfUrl = pdfUrl;
      chunk.metadata.fileName = req.file.originalname;
    });

    await MongoDBAtlasVectorSearch.fromDocuments(chunks, embeddings, {
      collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log(` ${chunks.length} chunks stored in MongoDB`);

    return res.json({
      message: "PDF uploaded and processed!",
      fileName: req.file.originalname,
      pdfUrl,
      chunks: chunks.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });

    const retriever = vectorStore.asRetriever({ k: 4 });
    const relevantDocs = await retriever.invoke(question);

    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0,
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a helpful assistant that answers questions based on PDF content.
      Use ONLY the context below. If unsure, say "I don't have enough information."

      Context: {context}

      Question: {input}

      Answer:
    `);

    const chain = prompt.pipe(llm);
    const result = await chain.invoke({ context, input: question });

    return res.json({
      answer: result.content,
      sources: relevantDocs.map((d) => d.metadata.fileName) ?? [],
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.json({ status: "all good" }));

app.listen(process.env.PORT || 10000, () => {
  console.log(`Server running on port ${process.env.PORT || 10000}`);
});
