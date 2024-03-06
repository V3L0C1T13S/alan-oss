# AI

Alan OSS Supports multiple AI Backends, all of which have their own benefits.

## Eliza (default)

Eliza is based on the 1950s virtual therapist Eliza. It is the fastest backend, but cannot have in-depth conversation. Due to it being lightweight, and decent enough to have incredibly basic conversation, it is the default.

## Vertex (recommended)

Vertex AI is a service by Google that allows access to Google LLMs, such as Gemini Pro. This backend is recommended for in depth conversation due to its completely free pricing, and its incredibly fast response times.

Features:

* Image recognition
* Characters

## Ailsa (recommended)

Ailsa is the official AI model for Alan OSS. In order to use this backend, you must be invited to the Ailsa beta test for developers.

Features:

* Image recognition
* Characters (Requires access to "Khara" service)

## OpenAI

The OpenAI backend uses either a locally hosted OpenAI compatible web server, or the official OpenAI services for AI. It is the highest performing option for locally hosted AI, and supports a variety of models due to this.

Features:

* Image recognition
* Characters

## Bard (deprecated)

The Bard backend uses Google Bard for AI. Despite Bard posessing more accurate and up to date information due to its access to Google search, it is slated for removal as its API frequently changes, and it has unstable session tokens.

Features:

* Image recognition

## LLaMA (deprecated)

The LLaMA backend uses LLaMA.cpp to process AI locally. It is incredibly intensive due to it creating a new process for each prompt, and is slated for removal.

## Vercel (deprecated)

The Vercel backend uses a reverse engineered Vercel AI API to run AI LLMs such as LLaMA.