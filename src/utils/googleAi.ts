
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyA_Woa6dnRoGOiKGlavCvT0fmDsmkf9yco";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function askGoogleAi(prompt: any, type = 'gemini-pro') {
  const model = genAI.getGenerativeModel({ model: type });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch(e) {
    return Promise.reject();
  }
}