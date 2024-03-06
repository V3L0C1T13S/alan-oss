import { Octokit } from "@octokit/rest";
import { BaseAIManager } from "./index.js";

const octoKit = new Octokit();

export async function summarizeGithubProfile(username: string, ai: BaseAIManager) {
  const { data } = await octoKit.rest.users.getByUsername({
    username,
    type: "public",
  });

  const ownedRepos = await octoKit.rest.repos.listForUser({
    type: "all",
    username,
    sort: "updated",
  });

  const selectedRepos = ownedRepos.data.slice(0, 10);

  const summary = await ai.ask(`Create a detailed analysis of the following Github developer using the information below:
Username: ${username}${data.bio ? `\nBio: ${data.bio}` : ""}${data.followers ? `\nFollowers: ${data.followers}` : ""}
Recent repos:\n${selectedRepos.map((repo) => `${repo.name}\nDescription: ${repo.description}\nLanguage: ${repo.language}`).join("\n\n")}
  `);

  return summary;
}
