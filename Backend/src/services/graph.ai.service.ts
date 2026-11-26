import {
  StateSchema,
  MessagesValue,
  type GraphNode,
  StateGraph,
  START,
  END,
  Graph,
} from "@langchain/langgraph";
import * as z from "zod";
import { cohereModel, geminiModel, groqModel, } from "./model.service.js";
import { createAgent, HumanMessage, providerStrategy } from "langchain";

const state = new StateSchema({
  problem: z.string().default(""),
  solution_1: z.string().default(""),
  solution_2: z.string().default(""),
  judge: z.object({
    solution_1_score: z.number().default(0),
    solution_2_score: z.number().default(0),
    solution_1_reasoning: z.string().default(""),
    solution_2_reasoning: z.string().default(""),
  }),
});

// create node
const solutionNode: GraphNode<typeof state> = async (state) => {
  const [openAiResponse, cohereResponse] = await Promise.all([
    groqModel.invoke(state.problem),
    cohereModel.invoke(state.problem),
  ]);
  return {
    solution_1: openAiResponse.text,
    solution_2: cohereResponse.text,
  };
};

const judgeNode: GraphNode<typeof state> = async (state) => {
  const { problem, solution_1, solution_2 } = state;

  // create agent to judge the response

  const aiJudge = createAgent({
    model: geminiModel,
    responseFormat: providerStrategy(
      z.object({
        solution_1_score: z.number().min(0).max(10),
        solution_2_score: z.number().min(0).max(10),
        solution_1_reasoning: z.string(),
        solution_2_reasoning: z.string(),
      }),
    ),
    systemPrompt: `You are a helpful assistant and you are a judge for the following problem: ${problem}, you have to judge the two solutions and provide a score between 0 and 10 for each solution, along with reasoning for your scores.`,
  });

  const judgeResponse = await aiJudge.invoke({
    messages: [
      new HumanMessage(`
        problem:${problem}
        solution_1:${solution_1}
        solution_2:${solution_2}
        so, please provide a score between 0 and 10 for each solution, along with reasoning for your scores.`),
    ],
  });

  const {
    solution_1_score,
    solution_2_score,
    solution_1_reasoning,
    solution_2_reasoning,
  } = judgeResponse.structuredResponse;

  return {
    judge: {
      solution_1_score,
      solution_2_score,
      solution_1_reasoning,
      solution_2_reasoning,
    },
  };
};

// graph

const graph = new StateGraph(state)
  .addNode("solution", solutionNode)
  .addNode("judge_node", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge_node")
  .addEdge("judge_node", END)
  .compile();
 
  export default async function runGraph(problem:string) {
    const result = await graph.invoke({
      problem:problem
    })
    return result
  }