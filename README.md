# Course Companion: Gen AI Internship Project

A small web app that answers questions from my 4-week Gen AI internship notes using **RAG**, selectable **prompting techniques**, and a **token budget**. Built for Dakh Edu Solutions.

**Live:** _add your Vercel link_

## How it works
1. Notes from all weeks are split into chunks (`KB` in `index.html`).
2. Your question is matched to the best chunks with TF-IDF cosine similarity.
3. The chosen prompting technique wraps your question.
4. `/api/chat` sends the notes plus question to the OpenAI API and returns a cited answer.
5. If the API is unavailable, the app still shows the retrieved notes.

## What each week contributed
| Week | Concept | Where it appears |
|---|---|---|
| 1 | Tokens, context window, responsible AI | Token meter, disclaimer, fixed context limit |
| 2 | RAG, embeddings and similarity search, CRAFT / few-shot / chain of thought, temperature | Retrieval function, technique dropdown, temperature slider |
| 3 | Prompt templates and chains, structured pipelines | Prompt templates, retrieve → augment → generate chain |
| 4 | System prompts, token limiting, API keys in `.env`, RAG vs fine-tuning | `api/chat.js`, `MAX_TOKENS`, drop-oldest-message budget, `.gitignore` |

**Simplification:** retrieval uses TF-IDF in the browser instead of neural embeddings and a vector database such as ChromaDB. It keeps the same retrieve-then-generate idea without extra infrastructure.

## Run and deploy
1. Push this folder to GitHub (the `.env` file is ignored).
2. On vercel.com choose **Add New → Project**, import the repo, then add environment variables `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`).
3. Deploy. Locally: `npm i -g vercel`, copy `.env.example` to `.env`, then `vercel dev`.

## Limits
Answers can be wrong; always check the cited week. No chats are stored.
