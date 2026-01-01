// // import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// class AIGradingService {

//   static async gradeOpenAnswer({
//     questionText,
//     studentAnswer,
//     maxScore
//   }) {

//     const prompt = `
// You are a university-level examiner.

// Grade the following answer WITHOUT a model solution.
// Use your own academic knowledge.

// Evaluate based on:
// - Conceptual correctness
// - Coverage of key ideas
// - Logical coherence
// - Penalize incorrect claims

// Maximum score: ${maxScore}

// Question:
// "${questionText}"

// Student Answer:
// "${studentAnswer}"

// Return ONLY JSON:
// {
//   "score": number,
//   "confidence": number,
//   "feedback": string
// }
// `;

//     try {
//       const response = await openai.responses.create({
//         model: "gpt-4.1-mini",
//         input: prompt
//       });

//       const result = JSON.parse(response.output_text);

//       return {
//         score: Math.min(Math.max(result.score, 0), maxScore),
//         confidence: Math.min(Math.max(result.confidence, 0), 1),
//         feedback: result.feedback,
//         gradingSource: "AUTO_AI"
//       };

//     } catch (error) {
//       console.error("AI grading failed:", error);

//       return {
//         score: 0,
//         confidence: 0,
//         feedback: "Automatic grading failed. Pending review.",
//         gradingSource: "NOT_GRADED"
//       };
//     }
//   }
// }
const AIGradingService =() => {}

export default AIGradingService;