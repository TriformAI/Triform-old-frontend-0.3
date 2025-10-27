# Triform

This repository is the frontend part of the app, developed using SvelteKit. Everything is canvas-based, which is a dynamic and modular workspace designed for building, visualizing, and managing AI functionality. The platform prioritizes flexibility and scalability, providing an intuitive interface that supports the development of AI implementations at scale.

## Setup Instructions

0. Optionally run `bun install` to get intellisense
1. Create the .env file using the contents of example.env as a template
2. Run `./compose.sh up --build`

## Building

In production, use the Dockerfile instead of Dockerfile.dev. It'll start a native Bun server on port 3000.

### Updating agent worker schema

Assuming that you have cloned the [agent-worker repo](https://github.com/TriformAI/agent-worker/tree/master)
and placed it in the same folder as triform-app repo, then you can simply run

`bun run parse:schema`

this will generate the ts types and put them in this file `src/lib/types/agent.ts`

##

ADD THIS INFROMATION TO THE DOCS

print("hello world")