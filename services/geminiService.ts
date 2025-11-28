import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client securely (assuming env var is set in the runner)
const ai = new GoogleGenAI({ apiKey });

// Define the schema for book responses
const bookSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      author: { type: Type.STRING },
      description: { type: Type.STRING },
      year: { type: Type.STRING },
      genre: { type: Type.STRING },
      coverColor: { type: Type.STRING, description: "A valid hex color code that matches the mood of the book cover" },
      rating: { type: Type.NUMBER, description: "A rating from 1 to 5" },
      reason: { type: Type.STRING, description: "A short reason why this matches the search query" }
    },
    required: ["title", "author", "description", "genre", "coverColor"]
  }
};

const cleanJsonText = (text: string): string => {
  if (!text) return "[]";
  // Robust extraction: find the first '[' and last ']' to ignore conversational preamble/postscript
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  
  if (start !== -1 && end !== -1 && end > start) {
      return text.substring(start, end + 1);
  }
  
  // Fallback: try to just strip markdown if specific brackets aren't found (unlikely for array)
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
};

const cleanJsonTextObject = (text: string): string => {
  if (!text) return "{}";
  // Robust extraction: find the first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end > start) {
      return text.substring(start, end + 1);
  }
  
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Recommend 8 books based on this search query: "${query}". 
                 If the query is a specific book, return similar books. 
                 Ensure the coverColor is a rich, aesthetic hex code.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: bookSchema,
        systemInstruction: "You are an expert librarian with impeccable taste. Curate lists of high-quality literature.",
      }
    });

    const jsonText = cleanJsonText(response.text || "[]");
    return JSON.parse(jsonText) as Book[];
  } catch (error) {
    console.error("Gemini search error:", error);
    return [];
  }
};

export const getCuratedShelf = async (genre: string): Promise<Book[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 defining or popular books for the genre/theme: "${genre}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: bookSchema,
      }
    });
    const jsonText = cleanJsonText(response.text || "[]");
    return JSON.parse(jsonText) as Book[];
  } catch (error) {
    console.error("Gemini shelf error:", error);
    return [];
  }
};

export const analyzeBook = async (bookTitle: string, author: string): Promise<{ summary: string, themes: string[], funFact: string }> => {
  try {
    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
        funFact: { type: Type.STRING }
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed analysis for the book "${bookTitle}" by ${author}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = cleanJsonTextObject(response.text || "{}");
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return { summary: "Analysis unavailable.", themes: [], funFact: "" };
  }
};

export const chatWithLibrarian = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are a wise, kind, and extremely well-read librarian named Eleanor. You help people find books, understand literature, and navigate the library. Keep your responses warm, encouraging, and relatively concise (under 100 words unless asked for more). Use markdown for formatting book titles in italics.",
            }
        });
        
        const result = await chat.sendMessage({ message });
        return result.text || "I apologize, I couldn't find the words.";
    } catch (e) {
        console.error("Chat error", e);
        return "I apologize, dear patron. I seem to have lost my train of thought. Could you repeat that?";
    }
}