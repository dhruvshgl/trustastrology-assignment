import { StateGraph, StateSchema } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import * as z from "zod";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { MATH_SYSTEM_PROMPT } from "../prompt/mathPrompt";
import { TECH_SYSTEM_PROMPT } from "../prompt/techPrompt";
import { GENERAL_SYSTEM_PROMPT } from "../prompt/generalPrompt";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "../prompt/orchestratorPrompt";
import { SUPERVISOR_SYSTEM_PROMPT } from "../prompt/supervisorPrompt";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite-preview",
});

const sectionSchema = z.object({
  name: z.enum(["math", "tech", "general"]),
  description: z.string(),
});

const sectionsSchema = z.object({
  sections: z.array(sectionSchema).describe("A list of specialist tasks to run"),
});

// Orchestrator planner with structured output
const planner = llm.withStructuredOutput(sectionsSchema);

// Graph state
const State = new StateSchema({
  input: z.string(),
  sections: z.array(sectionSchema).optional(),
  mathTask: z.string().optional(),
  techTask: z.string().optional(),
  generalTask: z.string().optional(),
  mathOutput: z.string().optional(),
  techOutput: z.string().optional(),
  generalOutput: z.string().optional(),
  output: z.string(),
});

const orchestrator: GraphNode<typeof State> = async (state, _config) => {
  const plan = await planner.invoke([
    {
      role: "system",
      content: ORCHESTRATOR_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: state.input,
    },
  ]);

  const findTask = (name: "math" | "tech" | "general") =>
    plan.sections.find((section) => section.name === name)?.description;

  return {
    sections: plan.sections,
    mathTask: findTask("math"),
    techTask: findTask("tech"),
    generalTask: findTask("general"),
  };
};

const llmCall1: GraphNode<typeof State> = async (state, _config) => {
  if (!state.mathTask) {
    return { mathOutput: "" };
  }

  const result = await llm.invoke([{
    role: "system",
    content: MATH_SYSTEM_PROMPT,
  }, {
    role: "user",
    content: `User request:\n${state.input}\n\nMath task:\n${state.mathTask}`
  }]);
  return { mathOutput: typeof result.content === "string" ? result.content : JSON.stringify(result.content) };
};

const llmCall2: GraphNode<typeof State> = async (state, _config) => {
  if (!state.techTask) {
    return { techOutput: "" };
  }

  const result = await llm.invoke([{
    role: "system",
    content: TECH_SYSTEM_PROMPT,
  }, {
    role: "user",
    content: `User request:\n${state.input}\n\nTech task:\n${state.techTask}`
  }]);
  return { techOutput: typeof result.content === "string" ? result.content : JSON.stringify(result.content) };
};

const llmCall3: GraphNode<typeof State> = async (state, _config) => {
  if (!state.generalTask) {
    return { generalOutput: "" };
  }

  const result = await llm.invoke([{
    role: "system",
    content: GENERAL_SYSTEM_PROMPT,
  }, {
    role: "user",
    content: `User request:\n${state.input}\n\nGeneral task:\n${state.generalTask}`
  }]);
  return { generalOutput: typeof result.content === "string" ? result.content : JSON.stringify(result.content) };
};

const supervisor: GraphNode<typeof State> = async (state, _config) => {
  const result = await llm.invoke([
    {
      role: "system",
      content: SUPERVISOR_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: [
        `User request:\n${state.input}`,
        `Math specialist output:\n${state.mathOutput ?? ""}`,
        `Tech specialist output:\n${state.techOutput ?? ""}`,
        `General specialist output:\n${state.generalOutput ?? ""}`,
      ].join("\n\n"),
    },
  ]);

  return { output: typeof result.content === "string" ? result.content : JSON.stringify(result.content) };
};

const orchestratorWorkflow = new StateGraph(State)
  .addNode("orchestrator", orchestrator)
  .addNode("llmCall1", llmCall1)
  .addNode("llmCall2", llmCall2)
  .addNode("llmCall3", llmCall3)
  .addNode("supervisor", supervisor)
  .addEdge("__start__", "orchestrator")
  .addEdge("orchestrator", "llmCall1")
  .addEdge("orchestrator", "llmCall2")
  .addEdge("orchestrator", "llmCall3")
  .addEdge("llmCall1", "supervisor")
  .addEdge("llmCall2", "supervisor")
  .addEdge("llmCall3", "supervisor")
  .addEdge("supervisor", "__end__")
  .compile();

export async function getOrchestratedAnswer(input: string): Promise<string> {
  const state = await orchestratorWorkflow.invoke({ input });
  return state.output;
}

export const getRoutedAnswer = getOrchestratedAnswer;

if ((import.meta as any).main) {
  const output = await getOrchestratedAnswer(
    "Write me a python code to reverse a linked list. and also tell me name of PM of India",
  );
  console.log(output);
}