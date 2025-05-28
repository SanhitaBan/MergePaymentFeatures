Perfect. I’ll create a full, zero-shot PRD for a client-side-only Prompt Review Tool that evaluates user-submitted prompts across multiple use cases (chatbot, code, image, research, etc.), provides detailed rewrite suggestions using GPT-4.1 and the uploaded OpenAI Prompting Guide, scores prompt quality, and enables ranking, profile badges, and CSV-based leaderboards.

This PRD will be structured so a coding copilot like Cursor can immediately begin development using HTML, CSS, and JavaScript alone.
I’ll return shortly with the full spec.


# Prompt Review Tool – Product Requirements Document

## Introduction

The **Prompt Review Tool** is a client-side web application designed to help users become better prompt engineers. It allows users to submit any AI prompt and receive an automated critique and improvement suggestions powered by GPT-4.1. By leveraging OpenAI’s official prompting best practices, the tool provides a detailed breakdown of how to refine the prompt for optimal results. All functionality runs entirely in the browser (HTML, CSS, and JavaScript), with no external backend – data is stored locally via browser storage and simple text files. This ensures user prompts remain private while still offering rich feedback and gamified features (like scores, badges, and leaderboards) to motivate learning and improvement.

**Product Goals:**

* **Improve Prompt Quality:** Enable users to iteratively refine prompts using GPT-4.1’s feedback, aligned with OpenAI’s guidelines (clarity, specificity, structure, etc.).
* **Multi-Use-Case Support:** Handle different prompt categories (chatbots, coding assistants, image generation, deep research, etc.) and tailor feedback criteria to each use case’s needs.
* **Education and Guidance:** Teach prompt engineering best practices through explanations and examples. For instance, encourage clear instructions and step-by-step breakdowns in complex tasks.
* **Gamification:** Keep users engaged via scoring, global rankings by continent, and unlockable badges for achievements. This provides friendly competition and a sense of progression that users can showcase (e.g. badges on LinkedIn or resumes).
* **Self-Contained Operation:** Function without a server – all user data (prompt history, scores, leaderboards) is stored in-browser (using LocalStorage and downloadable CSV logs), ensuring simplicity and privacy.

## Key Features (Summary)

* **Prompt Submission & Multi-Mode Evaluation:** Users can enter a prompt and select its type (e.g. Chatbot, Coding, Image Generation, Deep Research). The system will tailor its analysis criteria accordingly.
* **GPT-4.1 Powered Review & Scoring:** Upon submission, the tool uses GPT-4.1 (via an API call or local simulation) to evaluate the prompt. The prompt is scored on multiple criteria (clarity, specificity, structure, etc.) and given an overall quality score for that use-case.
* **Detailed Feedback and Improvement Suggestions:** The tool returns a breakdown explaining strengths and weaknesses of the prompt. It offers concrete suggestions for improvement – for example, if the prompt is vague, the system might recommend adding more details or examples.
* **Improved Prompt Generation:** The system provides an **improved version** of the user’s prompt, rewritten by GPT-4.1 following best practices (e.g. more direct instructions, structured format, etc.). The user can copy this or download it as a text file for use.
* **Local History Tracking:** All prompt submissions and results are stored locally. Users can view a history of past prompts, their scores, and improvements. This helps track progress over time.
* **Global Leaderboard (by Continent):** The app maintains a “global” leaderboard of top prompt scores. Users are identified by a chosen username and an optional LinkedIn or email, plus their continent (inferred from input). Leaderboard rankings can be viewed overall and filtered by continent to foster regional competition. *(Note: with no server, the leaderboard is stored locally in a CSV file and updated on each submission.)*
* **Badges & Achievements:** A gamified badge system awards users for accomplishments such as high-quality prompts, consecutive improvements, or ranking among top peers. Badges (with titles like *“Clarity Champion”* or *“Prompt Prodigy”*) can be unlocked and displayed in the user’s profile, giving them credentials to share externally.
* **Semantic Knowledge Graph (Local):** The tool builds a local “knowledge graph” of the user’s prompt engineering journey. It automatically extracts and stores key **topics**, recurring **entities/nouns**, and **prompt style characteristics** from each prompt. Over time, this semantic graph reveals patterns (e.g. common themes the user writes about, or frequent use of a particular style or format) and could be used for personalized insights or advanced features.

## User Interface & Interaction Flow

The Prompt Review Tool is a single-page web application (SPA) that dynamically displays different sections (screens) based on user interaction. Navigation is simple and linear: users typically start by entering a prompt on the Home screen, view results on the Review screen, and then optionally explore the leaderboard or their achievements. Below is a breakdown of each primary screen and its interactive elements:

### Home Screen – *Prompt Submission*

This is the initial view where users input their prompt and specify settings. Key UI elements and interactions on the Home Screen include:

* **Prompt Input Form:** A large text textarea where the user types or pastes the prompt they want to evaluate. This field may include placeholder text like *“Enter your prompt here…”*.
* **Use-Case Selection:** A dropdown or set of radio buttons labeled **“Evaluation Type”** with options such as: **Chatbot**, **Coding**, **Image Generation**, **Deep Research**, etc. The user must select one to tell the system what context the prompt is for. (Each option adjusts the scoring criteria internally.)
* **User Identification Fields:** Fields for **Username** (required) and **LinkedIn URL / Email** (optional). On first use, the user can enter a name and optionally a link or email – this identity will be used for the leaderboard and displayed with any top scores. The app infers continent from this input if possible (e.g. parsing country from LinkedIn profile) or via a separate dropdown for region. These inputs can be saved in localStorage to pre-fill next time.
* **Submit Button:** A prominent **“Review Prompt”** button. When clicked, the following happens (flow):

  1. **Validation:** The app ensures all required fields are provided – prompt text is not empty and an evaluation type is selected. If the username is missing, it prompts the user to enter one.
  2. **Loading Indicator:** Once validation passes, a loading spinner or message (“Evaluating prompt…”) appears, indicating that GPT-4.1 is being called to analyze the prompt. During this phase the UI is temporarily disabled or the form is hidden to prevent duplicate submissions.
  3. **GPT-4.1 API Call:** (Detailed in the *AI Integration* section) The frontend sends the prompt and selected type to the evaluation module. The user remains on the same page, but in practice we consider this a transition to the “Review Screen” state (the results will replace the form area).

*Interaction Flow (Home → Review):* The user fills out the form and clicks **Review Prompt**. The app then calls the evaluation API and, upon receiving the analysis results, seamlessly transitions to the Prompt Review screen, populating it with the feedback content. If any input is missing or invalid, the user stays on Home with an error message highlighting the issue.

### Prompt Review Screen – *Results & Feedback*

After submission, the Home form is replaced with the **Review Results** view. This screen presents the evaluation outcome for the submitted prompt, including the score, feedback, and suggestions. Key elements on the Prompt Review Screen:

* **Prompt Summary:** At the top, the user’s original prompt is displayed (possibly in a scrollable container if very long), so they can reference what was evaluated. It may be labeled *“Your Prompt (Chatbot)”* or *“Your Prompt (Image Generation)”* to reiterate the chosen context.

* **Overall Score:** A bold numeric or star rating is shown, e.g. *“**Score: 78/100**”* or *“Rating: 7.8/10”*. This gives the user an immediate sense of quality. The scoring logic is based on multiple criteria; a brief qualitative label might accompany it (e.g. *“Good”*, *“Needs Improvement”*). The scoring system is detailed later, but generally a higher score means the prompt followed best practices (clear, specific, well-structured, etc.).

* **Criteria Breakdown:** A section that lists how the prompt fared on each evaluation criterion, with short explanations. For example:

  * *Clarity:* **Fair** – The prompt could be more specific. It’s somewhat clear but leaves out details about the desired style or output length.
  * *Specificity:* **Poor** – The prompt is too general; consider adding context or examples so the model knows exactly what you want.
  * *Structure:* **Good** – The prompt is organized and uses bullet points, which helps the model understand the requirements.
  * *Instructions:* **Fair** – Important instructions appear at the start but could also be reiterated at the end for emphasis.
  * *…* (Other criteria depending on prompt type, e.g. for coding prompts there might be a criterion for “Provided relevant code context or error messages”).

  Each criterion corresponds to an aspect emphasized in OpenAI’s prompting guide (clarity, breakdown of tasks, formatting, etc.), and the feedback text references those principles. (These messages come directly from GPT-4.1’s analysis of the prompt.)

* **Improvement Suggestions:** A bulleted list or numbered list of specific suggestions for improving the prompt. These are actionable tips generated by GPT-4.1. For example:

  1. **Add Role or Context:** *“Specify the role of the AI or the context. E.g., ‘You are an expert lawyer...’ to guide tone and expertise.”*
  2. **Include Examples:** *“Provide an example scenario or input. This helps illustrate exactly what you’re asking for.”*
  3. **Break Down the Request:** *“If the task is complex, ask the AI to tackle it step by step or outline a plan.”*
  4. **Finalize Output Format:** *“Tell the AI exactly how you want the answer formatted (bullet list, essay, JSON, etc.) to avoid ambiguity.”*

  Each suggestion directly ties to known best practices from the OpenAI guide (for instance, being clear with instructions, providing structure or examples, etc.), which reinforces learning. The suggestions list will typically be 3-5 high-impact changes the user can make.

* **Improved Prompt Output:** Below the suggestions, the tool displays an **Improved Prompt** – a rewritten version of the user’s prompt that incorporates the above suggestions. This is generated by GPT-4.1 as part of the evaluation. The improved prompt will be presented in a formatted text box (read-only) so the user can examine how their original input could be rewritten. For example, if the original prompt was short and vague, the improved prompt will likely be longer, with clearer instructions and maybe sections, applying tips like including examples and step-by-step guidance. The user can **copy** this text via a button (for easy pasting into ChatGPT or elsewhere) or click a **“Download Prompt”** button to save it as a `.txt` file. This enables users to immediately utilize the better prompt.

* **Outcome Actions:** At the bottom of the results, a set of buttons allows the user to continue their workflow:

  * **“New Prompt”** or **“Try Another”** – Returns to the Home Screen (prompt input form) so the user can refine the same prompt or enter a new one. (If the user wants to iterate on the improved prompt, they can copy it back into the form on Home and resubmit, effectively a manual loop to see if it scores higher.)
  * **“View Leaderboard”** – Navigates to the Leaderboard Screen (see below) so the user can see how their score compares globally. This may be highlighted if the user just achieved a high score (e.g. a banner could say *“Congrats! You made the Top 10 – check the Leaderboard!”*).
  * **“My Achievements”** – (Optional link or button) Opens the Achievements/Badges view for the user to see any new badges earned or overall progress. If a new badge was unlocked by this submission, the interface might show a notification here (e.g. *“🏆 New Badge Unlocked: Clarity Champion!”*).

*Interaction Flow (Review Screen):* The user primarily reads and internalizes the feedback on this screen. They may choose to use the improved prompt or apply suggestions themselves. From here, they typically either go back to submit another prompt (starting a new cycle of improvement) or explore the leaderboard/achievements. The transition to other screens is done via the buttons – for example, clicking **View Leaderboard** will slide or switch the view to the Leaderboard Screen. The state (score, feedback) of the just-reviewed prompt is saved to history and also used to update the leaderboard and badge status behind the scenes at this moment.

### Leaderboard Screen – *Global & Regional Rankings*

The Leaderboard Screen showcases top prompt scores to encourage friendly competition and give context to the user’s performance. Because the app lacks a true server backend, this “global” leaderboard actually reflects all entries stored locally (which could include multiple users if the app is used by many people on one machine, or just the current user’s best results if used solo). The design still treats it as a global ranking for motivational purposes. Key elements of this screen:

* **Leaderboard Table:** A ranked list of the highest scoring prompt entries. Each entry in the table shows at least: **Rank**, **Username**, **Score** (and possibly the prompt type or a short title of the prompt). For example:

  | Rank | User        | Score | Prompt Type   | Continent     |
  | ---- | ----------- | ----- | ------------- | ------------- |
  | 1    | Alice AI    | 95    | Coding        | North America |
  | 2    | PromptPro99 | 93    | Deep Research | Europe        |
  | 3    | Sam         | 90    | Chatbot       | Asia          |
  | …    | …           | …     | …             | …             |

  The current user’s entries (if not in top N) might be highlighted or shown below the top list (e.g. *“Your best: Rank 15 (Score 78)”*). Each entry also shows the continent or region of the user (inferred from their profile). The table can be sorted or filtered.

* **Global vs Continent Filter:** At the top of the leaderboard, there are tabs or a toggle to switch between **“Global”** ranking and **“\[User’s Continent]”** ranking. By default, it might show Global (all users). If the user selects their continent (say, Europe), the table updates to show only users from that continent and their relative ranks. This makes it easy to see, for example, *“I’m #5 in Europe”* versus *“#20 globally”*. All data is derived from the same local dataset, just filtered. If the user’s continent is unknown (e.g. they skipped providing location), this filter can be disabled or default to global only.

* **Back/Close:** A back arrow or close button to return to the previous screen (likely the Review screen or Home). If a navigation bar is present, Home/Leaderboard could be separate links that can toggle views. In a single-page app, clicking Home or Back would hide the leaderboard and show the prompt input or last results again.

*Interaction Flow (Leaderboard):* This screen is mostly read-only. Users can scroll through rankings and possibly adjust the filter. If the user just arrived from reviewing a prompt, they might look for their name and score on the list. Once done, the user can click **Back** or **Home** to continue prompting. There’s minimal interactive action except viewing data.

### Achievements Screen – *User Badges & Profile*

The Achievements (or Profile) screen displays the user’s collected badges and possibly profile info. It reinforces the gamification aspect by showing what the user has earned and hints at what can be earned next. This screen may be implemented as a modal overlay or a separate section, since it’s closely tied to the user’s profile rather than a primary workflow step. Key components:

* **User Profile Summary:** At top, show the **Username** and perhaps the LinkedIn profile link or email the user provided (for their reference). Also list their **Continent** or location as identified. This just reiterates the identity being used on leaderboards. If needed, an “Edit Profile” button could be here to change name or details (which would update localStorage and reflect in future leaderboard entries).

* **Badge Gallery:** A grid or list of badges. Each badge is represented by an icon or emoji and a title. Earned badges are in full color or highlighted, while unearned (locked) badges are greyed out with a lock icon. For each badge, a short description is provided on hover or below the title, explaining why it’s awarded. For example:

  * **🎯 Clarity Champion:** *Achieved a perfect Clarity score in a prompt (the prompt had exceptionally clear instructions).*
  * **💡 Idea Incubator:** *Improved the same prompt 3 times in a row, each time increasing the score (3-step improvement streak).*
  * **🌍 Global Top 10:** *Entered the global top 10 leaderboard with a prompt score.*
  * **🏅 All-Rounder:** *Submitted prompts in all supported categories (chat, code, image, research).*
  * **🔥 Streak Master:** *Five consecutive prompts each with a higher score than the previous (improvement streak of 5).*

  *(These are example badges – the PRD will define a full list in the Badges section.)* Badges provide clear goals for users to strive toward, encouraging behaviors like focusing on clarity, practicing consistently, and exploring all prompt types. Users can mouse over a locked badge to see a hint like “Score 90+ to unlock this” etc., if we want to guide them.

* **Badge Export/Sharing:** Optionally, a feature to export or share badges. For example, each badge might have a “Share” icon that when clicked, downloads a small image of the badge or copies a text snippet the user can post (e.g. *“I earned the Clarity Champion badge on Prompt Review Tool!”*). This leverages the idea that users might add these achievements to LinkedIn or resumes – the app can facilitate by providing the assets or copyable text for them.

* **Close/Back:** A button to close the Achievements view and return to wherever the user came from (likely the Review screen or Home). If this is a modal, clicking outside or on a close “X” would dismiss it.

*Interaction Flow (Achievements):* Users typically come here to check what badges they have earned after using the tool for a while. It’s an at-a-glance dashboard of their progress. They might navigate here from a menu or after a prompt evaluation if a new badge was unlocked (e.g. a “View your badge” link in a popup). After viewing, they simply close the screen to continue with prompting or other activities.

### Navigation & Layout Notes

Since this is a single-page app, navigation between these “screens” can be handled by showing/hiding different sections of the HTML rather than loading new pages. A simple top navigation bar could be present with buttons or tabs for **“Home”**, **“Leaderboard”**, and **“Achievements”** for quick access. Alternatively, the flow can be mostly linear (Home → Review → then optional Leaderboard or Achievements) with back buttons.

All screens share a consistent look and feel (color scheme, typography) to make the experience cohesive. Important interactive elements like the Submit button or navigation links should be clearly visible and styled for usability. The design will also be responsive so that users on different devices (desktops, tablets) can use the tool easily – e.g. the prompt textarea will resize, tables will scroll on smaller screens, etc.

## Prompt Evaluation & Scoring System

One of the core functions of the Prompt Review Tool is its ability to **evaluate the quality of a prompt** and provide a score. This section describes the scoring methodology, criteria (which vary by prompt type), and how the system uses GPT-4.1 and the OpenAI Prompting Guide’s knowledge to generate a fair assessment.

### Evaluation Criteria

Each prompt is judged across several **criteria** reflecting best practices in prompt engineering. The criteria were derived from OpenAI’s own recommendations for effective prompts and generally applicable prompt quality measures. While the specific weighting of criteria can differ slightly by prompt type, the general set includes:

* **Clarity:** Is the prompt clear and unambiguous? Does it precisely state what the user wants? (A clear prompt uses specific wording and leaves little room for misunderstanding.)
* **Specificity & Context:** Does the prompt include relevant details and context? Specific prompts that include necessary information (e.g. context data or desired output format) tend to yield better answers. A good prompt may also set a persona or role for the AI if needed (for instance, *“You are an expert doctor…”* for a medical question).
* **Structure & Format:** Is the prompt well-structured or formatted in a way that aids understanding? Good prompts often organize information with lists, sections, or delimiters. For multi-part tasks, the prompt might explicitly outline steps or use headings for each part.
* **Completeness:** Does the prompt cover all aspects of the task or question? A complete prompt provides all necessary instructions or data. For example, if asking the AI to write code, a complete prompt might include the relevant code snippet or error message and specify the language. If something is missing (e.g. asking for analysis without providing a text to analyze), the prompt is incomplete.
* **Complexity Management:** If the request is complex, does the prompt break it down or instruct the AI to tackle it step-by-step? Prompts that guide the AI through complex tasks (using a chain-of-thought approach or stepwise thinking) usually get more accurate results. We check if the user prompt includes hints like “Let’s think step by step” or multiple sequential questions rather than one big question.
* **Instruction Emphasis:** For longer prompts, does the user reiterate important instructions at both the beginning and end? This is a known technique to keep the model on track. If the prompt is lengthy, the tool will check if critical directives (e.g. “provide answer in JSON format”) might be buried – if so, it’s a point to improve.
* **Originality/Creativity (for Image or Creative tasks):** If the prompt is for image generation or a creative writing task, is it phrased in a way to encourage creative output while still being specific? (For instance, describing an image in vivid detail, mentioning style or artist references for image prompts, etc.) A prompt that is too generic (“a cat”) would score low on specificity/creativity for image generation, whereas a richly detailed prompt (“a surreal oil painting of a blue cat reading a book under starlight”) would score higher.
* **Correctness & Constraints (for Coding tasks):** If the prompt involves code, does it clearly state the problem and any constraints? Does it provide examples of input/output or specify which function or section of code to focus on? A high-quality coding prompt might also tell the AI what *not* to do (e.g. “Don’t use external libraries”) or provide test cases.
* **Use of Best Practices:** This is a catch-all for any other best practices the prompt uses. For example, using delimiters (like triple quotes) to clearly separate system instructions from user content, or explicitly instructing the model to show its reasoning if appropriate. Also, instructing the model to use provided reference text only (to avoid hallucination) is considered a best practice for factual queries – the presence of such instruction can be a plus.

Each criterion is typically rated on a scale (e.g. Poor/Fair/Good/Excellent or a numeric 1–5). GPT-4.1 will provide these judgments in its analysis output (we format them for display as described on the Review Screen). Some criteria may not apply to all prompt types – for instance, **Originality/Creativity** is relevant for image or story prompts, but not so much for straightforward Q\&A prompts; **Correctness & Constraints** apply primarily to coding tasks.

### Scoring Method

The tool computes an **overall score** for the prompt, shown as a percentage or 0–10 scale for simplicity. Internally, this score is derived from the multiple criteria above. There are two possible approaches we will combine:

1. **AI-Generated Score:** GPT-4.1 itself can be asked to provide an overall score (for example, “Rate this prompt on a scale of 1 to 10 for its effectiveness”). This leverages the model’s judgment directly. However, we’ll calibrate the prompt given to GPT so that it uses the criteria above when deciding the score (to ensure consistency).
2. **Weighted Criteria Average:** Alternatively (or additionally), we can map each criterion rating to a numeric value and compute a weighted average. For instance, clarity and specificity might have higher weight than minor best practices. An example scheme: each criterion is rated 1–5, and we weight Clarity, Specificity, and Completeness as 2x others. The sum is then converted to a percentage.

In implementation, the **GPT-4.1 analysis** will likely return both — a breakdown and possibly a suggested score. We will primarily use GPT’s suggested overall score (as it’s informed by all factors), but the system may adjust or validate it with a simple rule-based check (e.g. ensure it’s roughly the average of criterion scores, to avoid any inconsistency). The final score presented is an integer out of 100 or a single decimal out of 10 for readability.

For example, a prompt that is very clear, specific, and structured but slightly incomplete might get criterion ratings like: Clarity 5/5, Specificity 4/5, Structure 5/5, Completeness 3/5, etc. The tool would translate that to maybe \~8/10 overall. GPT’s narrative might say “Overall, I’d score this prompt **8/10** – it is well-written and mostly comprehensive, just missing a couple of details.” That corresponds to the displayed score.

### Tailoring to Prompt Type

The evaluation criteria emphasis can change depending on the **prompt type** selected by the user:

* **Chatbot Q\&A Prompts:** Emphasis on clarity of the question, providing sufficient context or background, and specifying the desired style or format of answer. For chatbot prompts, conversational tone might be considered (e.g. if the prompt should instruct the AI to respond formally or humorously). The system also checks if the user prompt instructs the chatbot properly (like defining the role or constraints if needed). *Example:* A user prompt “Explain quantum computing in simple terms.” – We’d check clarity (yes, it’s clear), specificity (moderate – could specify length or analogies), structure (simple question, so structure is fine). Score might focus on whether the prompt could be improved by adding context (like target audience: children or adults?).
* **Coding/Programming Prompts:** Emphasis on including code context, error messages, or specific tasks. Criteria like “provided necessary technical info” are crucial. We also look for whether the prompt asks the model to explain code or produce code, and if it properly sets that expectation. *Example:* “There’s a bug in my code below. Can you fix it?\n`\ndef add(a,b):\n    return a - b\n`” – A good coding prompt would include what the expected behavior is (e.g. “It should return a + b but currently does subtraction”). If that’s missing, the feedback will note incomplete instructions. The scoring for coding prompts is strict about completeness and correctness of instructions.
* **Image Generation Prompts:** Emphasis on visual and stylistic details. Criteria include specificity (detailed description of subject and environment), style (mentioning art style, medium, lighting, etc.), and clarity (avoid ambiguous adjectives). Also, an important check is whether the prompt avoids disallowed or extremely vague terms (since image models require clarity to produce a coherent image). The scoring may also consider creativity – highly imaginative prompts that are still specific can be rated favorably. *Example:* “a portrait of a warrior” vs “a medieval warrior queen in golden armor, portrait painting, dramatic lighting, realistic style” – the second is far more specific and likely scores higher.
* **Deep Research Prompts:** These are prompts intended for tasks like comprehensive research or using tools (like the very prompt we are responding to, which required deep analysis). Criteria here stress **structure** (often these prompts are longer and need sections: e.g. provide context, specific instructions, desired format), **use of references** (does the prompt ask for citations or source validation if factual accuracy is needed?), and **step-by-step reasoning** (often important for research tasks to ensure thoroughness). A good deep research prompt might also set boundaries (like “If information is not found, say so instead of guessing” – which relates to guiding the model to not hallucinate). The tool will look for such patterns and score accordingly.

Under the hood, we provide GPT-4.1 with the context of which type of prompt it is so that it can adjust its feedback. For instance, for image prompts, GPT-4.1 will know to emphasize visual detail; for coding, to emphasize technical completeness; etc. The **OpenAI Prompting Guide** knowledge is embedded in these evaluations – e.g., GPT-4.1 knows to suggest breaking tasks down and using examples for complex prompts.

### Feedback Generation (Breakdown & Suggestions)

The scoring system is tightly coupled with **feedback generation**. GPT-4.1 doesn’t just score the prompt; it also explains *why* the prompt got that score and *how to improve it*. This is done by prompting GPT-4.1 (via the API) in a special way (see *AI Integration* for details). Essentially, the model is asked to act as a prompt expert and to:

* List the prompt’s strengths and weaknesses according to each criterion.
* Provide suggestions to address each weakness.
* Rewrite the prompt in an improved form.

This means the **improvement suggestions** and **improved prompt** are direct outcomes of the scoring analysis. For transparency and educational value, the tool shows as much of this breakdown as is useful. Users benefit not just from seeing a number, but understanding the rationale (e.g., “Clarity is good because the instruction was specific about the task” or “Specificity is poor because it didn’t mention what format the answer should be in”). Each point in the feedback links back to the criteria.

We make sure the feedback language is **constructive and easy to understand** – it will avoid overly technical jargon and instead refer to best practices. For example, instead of saying “Prompt lacks semantic richness,” it will say “The prompt could include more details or examples to help guide the AI.” This keeps the tone friendly and educational.

The knowledge from the *OpenAI Prompting Guide* is explicitly woven into the suggestions. For instance, the guide emphasizes using clear sections (Role, Instructions, etc.); if a user’s prompt is a long paragraph with mixed content, a suggestion might be: *“Split your prompt into clear sections (e.g. define the AI’s role, list the steps to do, specify output format) for better results.”* Similarly, if a prompt is asking for factual info without providing reference text, a suggestion might be: *“Consider providing a reference passage or data. This helps the model give more accurate answers.”*

### Rating Scale Definition

The exact mapping of quality to score will be defined so users can interpret their score: for example:

* 90+ (9-10/10): **Excellent Prompt** – Follows almost all best practices, should yield very accurate results.
* 75-89: **Good Prompt** – A solid prompt with minor improvements possible.
* 60-74: **Decent Prompt** – Some issues noted; applying suggestions will significantly improve results.
* 40-59: **Poor Prompt** – Prompt has major issues (too vague, incomplete, etc.) that will likely lead to subpar answers. Needs substantial revision.
* <40: **Very Poor** – The prompt is unclear or lacking enough that the AI’s output will be largely ineffective or off-target.

This range and wording will be visible perhaps as a small text next to the numeric score (for context). The goal is to keep the scoring encouraging – even a low score comes with helpful advice to get better.

The scoring system is thus both an **evaluation** and a **teaching mechanism**, using GPT-4.1’s analysis guided by known good prompting techniques to help users steadily improve their prompt engineering skills.

## Data Storage & Knowledge Graph

All user data in Prompt Review Tool is stored locally, since there is no server or cloud component. The app uses two main approaches for storing data in the user’s browser: **Web LocalStorage** for structured data (quick reads/writes within JavaScript), and simple text files (CSV or TXT) for data that might be exported or persisted between sessions manually. The “semantic knowledge graph” mentioned is also stored as structured data locally. This section details what is stored, how, and the format.

### LocalStorage Structure

We will utilize `window.localStorage` to keep persistent data (persisted in the browser sandbox) for the user. All data is stored under a specific key namespace (e.g. keys prefixed with `PRT_` for Prompt Review Tool) to avoid collision. The localStorage entries include:

* **User Profile** (`PRT_UserProfile`): Stores the user’s name and optional contact, plus derived data like continent. Format: a JSON object as a string. Example:

  ```json
  {
    "username": "Alice AI",
    "contact": "alice@example.com", 
    "continent": "North America"
  }
  ```

  The `continent` field might be filled after the user enters a country or LinkedIn URL. (If LinkedIn URL is provided, we could attempt to parse it for location using an API call – but with no backend, likely we instead ask the user to pick their continent from a dropdown when setting up profile.) If the user updates their info, this record is updated. It’s used to tag their entries on the leaderboard.

* **Prompt History** (`PRT_History`): Stores an array of past prompt evaluations for the user. Each entry in the history array is an object with details of one prompt submission. Format example for each entry:

  ```json
  {
    "timestamp": "2025-05-11T21:30:00Z",
    "prompt": "Explain quantum computing in simple terms.",
    "type": "Deep Research",
    "score": 78,
    "criteria": {
      "Clarity": 4,
      "Specificity": 3,
      "Structure": 5,
      "...": ...
    },
    "improvedPrompt": "Provide an explanation of quantum computing for a layperson, covering key concepts, using simple analogies, and keep it under 3 paragraphs.",
    "badgesUnlocked": ["Clarity Champion"]
  }
  ```

  This captures when the prompt was reviewed, the text (could be truncated or a reference if very large, but we can store full text for fidelity), what category it was, the score and maybe individual criteria ratings, the improved version of the prompt, and any badges unlocked by that submission. Storing the improved prompt is useful in case the user wants to revisit it later. The criteria sub-object is optional (we might not store all breakdown details, but it can help if we allow re-viewing an old result). The history array is sorted by time (new entries pushed to end). This key allows the “My History” feature if we build one (not explicitly in UI spec, but could be used for analytics or user reference).

* **Global Leaderboard Data** (`PRT_Leaderboard`): This stores all high-score entries that populate the leaderboard. We have two options:

  1. **Deduce from History:** We could generate the leaderboard on the fly from the history (or multiple users’ histories if available). But since we might allow multiple users in one app instance (if people share a machine or if a user wants to input others’ scores manually), we maintain a separate list purely for leaderboard entries.
  2. **Directly Store Leaderboard Entries:** Every time a prompt is evaluated, if its score qualifies for top N or is above a certain threshold, we add it to this list. However, this could lead to duplicates if the same user appears multiple times. Alternatively, we store every attempt and then filter. Simpler: treat it as a log of all submissions (like history) but including all users, not just the current one (though in a single-user scenario they are the same).

  A straightforward approach: whenever a prompt is reviewed, append an entry line to a CSV (see below) **and** update a JSON array in localStorage. The JSON array can be easily sorted and filtered in the client. Format of each entry similar to history but focusing on rank data:

  ```json
  {
    "username": "Alice AI",
    "continent": "North America",
    "score": 95,
    "promptTitle": "Fix bug in code",
    "type": "Coding",
    "timestamp": "2025-05-11T21:35:00Z"
  }
  ```

  Here `promptTitle` could be either the full prompt text or a shortened summary/title (for brevity on the leaderboard). We might derive a title by taking the first few words or a user-provided title if we ever ask for one. Storing the type and timestamp can allow additional sorting or filtering (like “top in last week” if needed, though not in initial scope).

  The Leaderboard data is used to render the table. On app load, we read `PRT_Leaderboard` from storage to populate the leaderboard view. If it’s empty (first run), we start a fresh array.

* **Badges/Achievements** (`PRT_Badges`): Stores which badges the user has unlocked. Format: a JSON object mapping badge IDs to a boolean or timestamp unlocked. Example:

  ```json
  {
    "clarity_champ": "2025-05-11T21:30:00Z",
    "streak_3": "2025-05-12T18:00:00Z",
    "streak_5": false,
    "all_rounder": false,
    "...": "..."
  }
  ```

  In this example, `clarity_champ` and `streak_3` have timestamps indicating when they were earned, while others are false (not yet earned). Alternatively, we could store an array of earned badge IDs and infer unlocked status by presence. But a map allows easily adding new badges and checking existence. This data drives the Achievements screen – to show which are unlocked and which are not. The timestamp can be used if we want to display “earned on X date” or the order in which badges were earned.

* **Knowledge Graph Data** (`PRT_KnowledgeGraph`): This holds the semantic graph info (topics, entities, styles). We need a structure that can grow as more prompts are analyzed. A proposed format:

  ```json
  {
    "topics": {
       "healthcare": 3,
       "quantum computing": 2,
       "JavaScript": 5,
       "...": ...
    },
    "entities": {
       "OpenAI": 4,
       "FDA": 1,
       "...": ...
    },
    "styles": {
       "uses_examples": 2,
       "structured_format": 4,
       "chain_of_thought": 3,
       "persona_specified": 1,
       "...": ...
    },
    "associations": [
       // optional: relationships e.g. connecting topics to style usage 
       { "topic": "healthcare", "style": "uses_examples", "count": 2 },
       { "entity": "OpenAI", "topic": "quantum computing", "count": 1 }
    ]
  }
  ```

  Here we break it into categories:

  * `topics` keeps a tally of how many prompts involved each topic. Topics might be derived by analyzing prompt text for key themes or domain (GPT-4.1 can output keywords). For instance, if a prompt asks about AI in healthcare, topic “healthcare” would increment.
  * `entities` tracks named entities or proper nouns that recur. E.g., “OpenAI” mentioned in multiple prompts, “Python”, specific libraries, etc.
  * `styles` tracks features of prompt style. This could include boolean features like “used bullet points” (`structured_format`), “included examples” (`uses_examples`), “told AI to think step-by-step” (`chain_of_thought`), “specified AI persona or role” (`persona_specified`), etc. If a prompt uses a certain technique, we increment that counter. Over time, this reveals which techniques the user employs often.
  * `associations` is an optional array of relationships if we want to capture co-occurrence (e.g., a certain topic often coincides with using a structured format). This could be used for deeper analysis or visualization, but we might omit it initially for simplicity.

  The knowledge graph data is updated after each prompt evaluation. GPT-4.1 can be asked to output the key topics and entities for the prompt as part of its analysis (since it understands the content of the prompt). Alternatively, simple keyword extraction could be done via a small script or using the browser (though GPT’s output is likely more accurate for themes). For styles, the system can detect based on prompt text (e.g., check if it contains bullet point characters, or if it has words like “Step 1.”, indicating an outlined structure, etc.) and also leverage the evaluation (if GPT noted “the prompt provided examples”, we can infer uses\_examples = true). We combine these signals to update the counts.

  This data is *not directly shown* to the user in the current UI except possibly as interesting stats, but it can enable future features. For example, we could add a section showing “Most common topics you write about” or “Techniques you use most vs least”, giving personalized feedback. The PRD scope focuses on tracking the data; visualization can be a future enhancement.

All the above localStorage entries are saved whenever changes occur (after each prompt submission, after profile edit, etc.). They persist between sessions, so if the user closes and reopens the app in the same browser, their data is still there.

### CSV/Text Data for Global Log

In addition to localStorage, the app uses a **CSV file** (Comma-Separated Values text) to maintain a log of prompt submissions intended to simulate a “global” database of scores. Since the app cannot truly share data across users without a backend, the CSV serves two purposes: a persistent record that could be manually shared/merged, and a simple way for technically savvy users or developers to view the data outside the app (e.g. open in Excel).

The CSV file (let’s call it `prompt_review_log.csv`) is updated by appending a new line for each prompt reviewed. This happens on the client side by generating a CSV formatted string and either storing it or prompting the user to save it. Possible implementation: use the HTML5 *File System Access API* or create an object URL to allow downloading an updated CSV. If those are too complex, we can store the CSV content in localStorage as well (like `PRT_CSV`) and provide a “Download Full Log” button that triggers a file download of that content.

**CSV Format:**
The columns might be: `Timestamp, Username, Continent, PromptType, Score, PromptSnippet`. Each row is one submission. For example:

```
2025-05-11T21:30:00Z, "Alice AI", "North America", "Deep Research", 78, "Explain quantum computing in simple terms..."
2025-05-11T21:35:00Z, "Alice AI", "North America", "Coding", 95, "Fix bug in code snippet..."
```

We include a short snippet of the prompt just for context (maybe first 5-8 words, trimmed and ellipsed if longer). If fields contain commas (rare in these fields except PromptSnippet), we will quote them as per CSV standard.

**Appending Only:** The app will strictly append new lines and never modify or delete lines in this file (no editing past entries). This ensures a simple log structure. If a user updates their username, new entries will reflect the new name but old entries remain with the old name (this is acceptable given no edit). The CSV is essentially an ever-growing audit log.

On each new prompt evaluation, the app will:

* Format the entry as a CSV line.
* If storing in localStorage, concatenate it to the existing CSV string (with a newline).
* If offering download, perhaps update an in-memory blob for the file.

The “global” leaderboard is derived from this CSV content. On loading the app or when viewing the leaderboard, the app will parse the CSV (or read the JSON list in localStorage that mirrors it) to build the ranking.

**Note:** Because in a truly local scenario only one user is adding to the CSV, the “global” aspect is mostly theoretical (it’s global within that user’s data). However, if multiple users exchange their CSVs or if this app is used in a classroom setting where everyone’s data is merged into one file manually, the leaderboard could become truly multi-user. The PRD ensures that the system is ready for that possibility by keeping the structure flexible.

### Data Reset and Privacy

Since all data is local, the user should have controls to manage it. We will include a **“Reset Data”** or **“Clear History”** option (perhaps in a small settings menu or at least documented) that wipes the localStorage keys and clears the CSV log. This lets the user start fresh if needed (and also is useful for development/testing to clear state).

Privacy-wise, no data leaves the user’s machine unless they explicitly choose to share/download it. If the user provides an email or LinkedIn URL, that too stays local (there is no server collecting it). The only external calls the app makes are to the OpenAI API for GPT-4.1 analysis (which does send the prompt content to OpenAI’s servers for evaluation). Users should be informed of this in an about section: *“Prompt text is sent to OpenAI for analysis; no other personal data is transmitted.”* If offline mode is used (with a local AI model or stub), then even that call doesn’t happen.

## Leaderboards and Gamification Logic

To motivate users, the Prompt Review Tool includes competitive and reward-based features: a **leaderboard** showcasing top performances and a **badge system** for achievements. This section defines how these systems work in detail – how rankings are determined, how badges are unlocked, and how the logic is implemented in the app.

### Global & Continent Leaderboard Logic

The leaderboard uses the data stored in local CSV/JSON to display rankings. Here is how it’s determined and updated:

* **Updating the Leaderboard:** After each prompt evaluation, the app takes the new result and inserts it into the leaderboard data. If we are storing every entry, it simply appends it. If we choose to only store top N to limit size, it would check if the new score qualifies (for simplicity, we are storing all and will compute top N when rendering).

  * If the new score is among the highest the user has achieved, it might improve their standing. We might want to avoid duplicate user entries in the “Top 10” display, so one design decision: **one entry per user on the displayed leaderboard, specifically their best score.** This way, the leaderboard highlights unique users’ best efforts rather than potentially one user occupying multiple top slots. We will implement it such that when computing display ranks, we group by username and take the max score. (The CSV still has all attempts, but for ranking we condense by user.)
  * If a user beats their own previous best, the leaderboard entry for that user is updated with the new score and timestamp. If a user submits a lower score later, it does not affect their leaderboard entry (we keep the best).

* **Ranking Criteria:** Sorting the leaderboard is primarily by **Score (descending)**. In case of ties, we could use secondary criteria like who achieved it first (earlier timestamp gets higher rank, to reward early achievement), or we could show ties with the same rank. We’ll sort by score, then by timestamp ascending (older first for same score). That means if two users both have score 90, the one who got 90 earlier will appear above (since the other achieved it later, effectively tying). This is a minor detail, and we’ll note it in the implementation.

* **Regional Filtering:** Each entry has a continent field. The continent is determined from the user profile at the time of submission. On the Leaderboard UI, the user can filter by continent. Implementation: simply filter the list to entries where `continent == userProfile.continent` (for the current user’s region filter). We will also have an “All” view for global. If the user’s continent is unknown or not set, the filter option might be disabled or we consider those entries only in global.

  * If a user’s profile had no continent and they later add it, their old entries might be missing region info. We could default those to “Unknown” and perhaps exclude from region filter or treat “Unknown” as its own category. For now, we assume most will set it.

* **Displaying User Rank:** We will compute the current user’s rank each time (so they know where they stand). If the user is in the top N displayed, that’s obvious. If not, we can show a line like *“Your best score: 78 (Rank 15 of 30)”*. Rank calculation involves sorting all entries by score as above and finding the index of the current user. Because we condensed by user, “Rank 15 of 30” would mean 30 total users in list, and their position. We will update this whenever the leaderboard is refreshed.

* **Capacity:** Since we’re storing this locally, we might limit the displayed entries (like show top 10 or top 20 by default for brevity, with an option to scroll or “show all” if the list is long). In a single-user context, the list won’t be large; but if merged data from many users, it could grow. Still, even a few hundred entries is fine for a browser to handle.

* **Example Scenario:** Suppose the user “Alice AI” has used the tool and got scores 78, 88, 95 on different attempts. The leaderboard stored her best as 95. Another user “Bob” (if his data were in the log) has best 90. The global leaderboard will show Alice rank 1 (95), Bob rank 2 (90), etc. Alice’s continent is NA, Bob’s is EU, so if Alice filters to NA, she sees herself maybe rank 1 in NA (if no other NA user close). This encourages her to maintain her lead or see if any region lacks top scores.

* **No External Backend:** It’s worth reiterating the “global” is within the scope of the data present. If the tool is truly used by one person, the leaderboard is effectively their personal best list (which is still motivating to beat your own high score). In a multi-user scenario (like a workshop where people share their logs), it becomes a real competition. The system is built to accommodate that seamlessly if data is combined.

### Badge System Logic

Badges are like mini-achievements that reward certain milestones or patterns of use. The logic for each badge includes a **trigger condition** and an action to unlock it. The tool will check these conditions whenever a prompt is evaluated (because that’s when user actions happen and scores change). If a condition is met and the badge isn’t already unlocked, the tool will mark it as unlocked and notify the user.

Here are the **planned badges** and their unlock criteria (the PRD can be updated with more, but we’ll list a robust set):

1. **Clarity Champion** 🏅 – *“Achieve a perfect Clarity score on any prompt.”*
   **Trigger:** In the feedback from GPT-4.1, the Clarity criterion is maxed out (e.g. 5/5 or described as “excellent clarity”). We detect this either by a numeric value or a keyword in GPT’s feedback (like “very clear prompt”). If the prompt’s clarity is deemed perfect, unlock this badge. This encourages writing unambiguously. *(We could also require the overall score to be high, but clarity specifically should stand on its own for this badge.)*

2. **Structured Sage** 📐 – *“Submit a prompt that uses exemplary structure and formatting.”*
   **Trigger:** The prompt used multiple best practice formatting techniques: e.g. it had sections or bullet points, provided an example, etc., and GPT’s feedback is very positive about structure (or structure criterion is perfect). Alternatively, if a prompt includes at least three of the following: a role definition, bullet list, an example, and an explicit output format instruction – then it qualifies as highly structured. Unlock when such a prompt is submitted.

3. **Prompt Prodigy** 🌟 – *“Score 90 or above on a prompt.”*
   **Trigger:** Any prompt evaluation yielding an overall score ≥ 90 (out of 100) unlocks this. It’s essentially the “A-grade” prompt badge. It shows the user they’ve written an excellent prompt. (This might be a one-time badge, or we could have multiple tiers like 90+, 95+, but let’s keep one for now.)

4. **Improvement Streak x3** 🔥 – *“Improve your prompt score 3 times in a row.”*
   **Trigger:** The user submits at least three prompts sequentially where each prompt’s score is higher than the previous prompt’s score. This implies continuous improvement over three iterations. We maintain an “improvement streak counter” in state: if current\_score > last\_score, increment streak; if not, reset streak. When streak reaches 3, unlock this badge (and similarly for higher streaks below). The user doesn’t necessarily have to be revising the exact same prompt, just that each new prompt they try is better than their last in terms of quality score – which indicates learning.

5. **Improvement Streak x5** 🔥🔥 – *“Improve your score 5 prompts in a row.”*
   **Trigger:** Same logic as above but for 5 consecutive improvements. This is a harder badge to get, showing consistent learning over time. We might even add one for 10 if needed, but 5 is a good mark for now.

6. **All-Rounder** 🧩 – *“Use all prompt types at least once.”*
   **Trigger:** The user has submitted at least one prompt in each available category (Chatbot, Coding, Image, Deep Research, etc.). We track a set of categories used in localStorage or derive from history. When the size of that set equals the total number of types, unlock this badge. This encourages users to practice prompts in every domain, broadening their skills.

7. **Global Contender** 🌍 – *“Reach the global Top 10 leaderboard.”*
   **Trigger:** After a prompt evaluation, check the current user’s global rank. If it is ≤ 10, and this badge is not yet unlocked, unlock it. In a single-user environment the user is always rank 1 by default, so perhaps we should require a score threshold as well (to avoid trivial unlock). Alternatively, interpret this as “score above a certain benchmark that typically equates to top 10 globally.” However, since we can compute rank locally, we use rank. If multiple users, this is meaningful; if one user, they’ll get it once they break a certain high score presumably.

8. **Continental Champion** 🏆 – *“Achieve #1 rank in your continent.”*
   **Trigger:** Similar approach, but check if user’s score is the highest among entries with the same continent. If yes (and perhaps above some minimum like >50 to avoid trivial), unlock this. If there are multiple users and the person becomes the best in their region, they get it. If one user, they are trivially #1 on their continent by default, so maybe also require that they have at least one high-quality prompt (e.g. >80) to make it meaningful. We can combine conditions or simply accept that in a single-user scenario this badge isn’t really significant. This is more for if data is merged or multi-user.

9. **Persistence Hunter** ⏳ – *“Review 20 prompts (showing dedication to practice).”*
   **Trigger:** When the history count reaches 20 prompts (or some threshold like 20), unlock this. This rewards continued usage. We could have tiers (e.g. 10 prompts = bronze, 50 = silver, etc.), but one simple badge at 20 or 25 is fine to start.

10. **Knowledge Guru** 🧠 – *“Incorporate reference text or citations in a prompt.”*
    **Trigger:** If the user writes a prompt that includes a block of reference text or asks for citations (e.g. the prompt text contains quotes or mentions “according to \[source]”), that indicates an advanced technique of giving context. The tool can detect this (presence of quotation marks block or “cite” keywords, etc., or GPT feedback noticing it). Unlock this badge the first time a user does that. This encourages users to feed context to the model for factual accuracy.

Each badge has a unique ID (like `clarity_champ`, `streak_3`, etc. as used in storage) and an unlock condition as described. Implementation details:

* After each prompt evaluation is completed (and before showing the result or right after showing it), the app runs a function `checkBadges(currentResult)` that evaluates each badge rule against the latest data. This function will:

  * Have access to the `currentResult` (score, criteria ratings, prompt text, etc.), the `userProfile` (for region badges), the `history` or at least the last few entries (for streaks), and `usage stats` (like count of prompts, categories used).
  * For each badge, if not already unlocked (`PRT_Badges[badgeId] == false`), evaluate its condition:

    * If condition true, set that badge’s value to the current timestamp in `PRT_Badges` (marking it unlocked) and add the badge ID to a list `newlyUnlocked` for this round.
  * After checking all, if `newlyUnlocked` is non-empty, update localStorage, and then trigger a UI update to inform the user. Usually, we’d show a modal or toast notification: e.g. “🎉 You earned a new badge: *Prompt Prodigy*!”. In the Achievements screen, that badge will now be highlighted.

* **Multiple Badges at Once:** It’s possible to unlock multiple badges from one prompt. For example, a single high-scoring prompt could give *Clarity Champion* (if clarity was perfect) and *Prompt Prodigy* (score 90+) simultaneously. The system should handle unlocking both and showing messages for each or a combined message.

* **Badge Persistence:** Once unlocked, a badge remains unlocked. Even if the user’s rank drops later or they don’t maintain streak, the badge stays – it represents that they achieved that at least once. This is standard behavior for achievements.

* **Viewing Badges:** The Achievements screen logic reads `PRT_Badges` to know which badges to highlight. The badge definitions (name, description, icon) will be hardcoded or in a config JSON in the app, and the unlocked status comes from storage. We ensure to add any new badge IDs to storage (initially as false) when the app first runs or is updated so the keys exist to track.

This gamification element is meant to reinforce positive behaviors:

* Writing clearly and specifically yields the *Clarity Champion* or *Prompt Prodigy* badges.
* Consistent practice yields *Persistence Hunter*.
* Improving iterative approach yields the streak badges.
* Exploring all features yields *All-Rounder*.
* Competing well yields *Global Contender* / *Continental Champion*.

It’s important for the PRD that we list these triggers so developers can implement the checks accordingly.

## Technical Architecture & Implementation Components

Since the Prompt Review Tool is to be built in a “zero-shot” coding environment (like Cursor) and is purely front-end, we outline the architecture in terms of HTML structure, JavaScript modules, and how the GPT-4.1 integration is orchestrated. The goal is to have a clear separation of concerns: UI rendering, data management, and AI interaction.

### HTML Structure

The application will be delivered as a single HTML file (e.g. `index.html`) that contains the structure for all the screens described. We will use semantic container elements and IDs to manage visibility of different sections. Here’s an outline of the HTML components:

* **Header/Nav:** A top `<header>` bar containing the app title (e.g. “Prompt Review Tool”) and possibly navigation buttons for Home, Leaderboard, Achievements. If using a single-page approach, these can simply be buttons that trigger showing the respective section. For example:

  ```html
  <header>
    <h1>Prompt Review Tool</h1>
    <nav>
      <button id="navHome">Home</button>
      <button id="navLeaderboard">Leaderboard</button>
      <button id="navAchievements">Achievements</button>
    </nav>
  </header>
  ```

  The nav buttons are optional if we primarily navigate via on-screen buttons (like from results). Including them gives a direct way to switch screens.

* **Main Container:** A `<main>` element that holds sub-sections for each of the screens:

  * **Home Section:** `<section id="homeSection">` containing the prompt input form elements (textarea, dropdown, name fields, submit button). We’ll use a `<form>` so that pressing Enter can submit, and standard form validation could be used. Example snippet:

    ```html
    <section id="homeSection">
      <form id="promptForm">
         <label>Enter your prompt:</label>
         <textarea id="promptText" required></textarea>
         <label>Evaluation type:</label>
         <select id="promptType" required>
            <option value="" disabled selected>Select a use case</option>
            <option>Chatbot</option>
            <option>Coding</option>
            <option>Image Generation</option>
            <option>Deep Research</option>
         </select>
         <div id="userInfoInputs">
            <input type="text" id="username" placeholder="Username" required>
            <input type="text" id="userContact" placeholder="LinkedIn URL or Email (optional)">
            <select id="userContinent"> ...options... </select> <!-- optional dropdown for continent -->
         </div>
         <button type="submit" id="submitBtn">Review Prompt</button>
      </form>
    </section>
    ```

    The continent dropdown can be populated with values like “North America, South America, Europe, Asia, Africa, Oceania” for user to choose. Or we infer after they enter contact by possibly mapping domain (like email domain country or LinkedIn profile data) – but that’s complex to do client-side without an API. So a simple manual selection is fine. We can hide the continent selector if we want to infer, but likely easier to just ask.

  * **Review Section:** `<section id="reviewSection" style="display:none;">` (initially hidden) containing the result layout. Key fields: a div for prompt summary, a score display element, a list for breakdown, a list for suggestions, a text area or pre tag for improved prompt, and action buttons. Example snippet:

    ```html
    <section id="reviewSection" style="display:none;">
      <h2>Prompt Review</h2>
      <div id="originalPromptDisplay"></div>
      <div id="scoreDisplay"></div>
      <div id="breakdownDisplay"></div>
      <ul id="suggestionsList"></ul>
      <div id="improvedPromptDisplay"></div>
      <button id="copyImprovedBtn">Copy Improved Prompt</button>
      <button id="downloadImprovedBtn">Download Improved Prompt</button>
      <div class="reviewActions">
         <button id="newPromptBtn">New Prompt</button>
         <button id="toLeaderboardBtn">View Leaderboard</button>
         <button id="toAchievementsBtn">My Achievements</button>
      </div>
    </section>
    ```

    The breakdownDisplay might be structured as a small table or list of criteria vs ratings. The improved prompt display can be in a `<textarea readonly>` or a `<pre>` tag to keep formatting. The improved prompt likely contains special formatting (like line breaks, bullet points) which should be preserved, so `<pre>` might be suitable, or a styled `<div>`.

  * **Leaderboard Section:** `<section id="leaderboardSection" style="display:none;">` containing the leaderboard table and filter controls. Example:

    ```html
    <section id="leaderboardSection" style="display:none;">
      <h2>Leaderboard</h2>
      <div id="leaderboardFilters">
         <button id="filterGlobal" class="active">Global</button>
         <button id="filterRegional">My Continent</button>
      </div>
      <table id="leaderboardTable">
         <!-- Table headers -->
         <thead>
           <tr><th>Rank</th><th>User</th><th>Score</th><th>Type</th><th>Region</th></tr>
         </thead>
         <tbody>
           <!-- Filled dynamically with rows -->
         </tbody>
      </table>
      <p id="userRankText"></p>  <!-- e.g. "Your best: Rank 5 of 12 globally" -->
      <button id="backFromLeaderboard">Back</button>  <!-- to go back to previous screen -->
    </section>
    ```

    The filter buttons toggle a state, and the table’s tbody will be populated via JS from stored data. The “Back” could simply call the same function as navHome if we use the nav.

  * **Achievements Section:** `<section id="achievementsSection" style="display:none;">` showing badges. Example:

    ```html
    <section id="achievementsSection" style="display:none;">
      <h2>My Achievements</h2>
      <div id="profileInfoDisplay">
         <p>Username: <span id="profileName"></span></p>
         <p>Continent: <span id="profileContinent"></span></p>
         <p>Contact: <span id="profileContact"></span></p>
      </div>
      <div id="badgesContainer">
         <!-- Each badge as an element -->
         <!-- Example badge element -->
         <div class="badge unlocked" id="badge_clarity_champ">
            <span class="badgeIcon">🏅</span>
            <span class="badgeName">Clarity Champion</span>
            <span class="badgeDesc">Perfect clarity in a prompt</span>
         </div>
         <div class="badge locked" id="badge_streak_3">
            <span class="badgeIcon">🔥</span>
            <span class="badgeName">Improvement Streak x3</span>
            <span class="badgeDesc">3 prompts in a row improved</span>
         </div>
         <!-- ... other badges ... -->
      </div>
      <button id="backFromAchievements">Back</button>
    </section>
    ```

    We will create one `.badge` element per badge, and toggle classes `unlocked/locked` based on `PRT_Badges`. The descriptions can either always be visible or only on hover. Since on mobile hover doesn’t exist, probably always show or on click show a tooltip. But for simplicity, just listing name and description like above is fine. The `badgeIcon` can be an emoji or actual image if we have assets. Emojis might suffice given simplicity (and they look uniform enough for a fun interface). The Back button returns to whatever previous context (or Home).

* **Modal/Notifications:** Optionally, to highlight new badges or errors, we might include a basic modal dialog overlay or a notification div. For example, a `<div id="notification" class="hidden"></div>` that we fill with text like “New Badge Unlocked!” and show temporarily. Or a modal `<div id="modalOverlay" style="display:none;"> ... </div>` for showing larger messages or confirmations. This is not strictly required but useful for user feedback (like confirming data reset, or showing badge details). We’ll include a minimal setup to allow such messages.

* **Script and Styles:** At the bottom of HTML, include our JavaScript files (or script tags) and a link to CSS. E.g.

  ```html
  <script src="js/main.js"></script>
  <link rel="stylesheet" href="styles.css">
  ```

  Where `main.js` will import or include other modules as needed. (In a zero-shot environment, maybe everything in one file is acceptable, but modularizing helps clarity.)

This HTML structure ensures we have the containers needed for dynamic content. Initially only Home (prompt form) is visible; others are hidden via inline `display:none` or via CSS classes. JavaScript will toggle these.

### JavaScript Modules and Responsibilities

To organize the code, we’ll separate concerns into the following modules (which can be separate `.js` files or self-contained sections in one file if needed):

1. **main.js (Controller):** This will be the central controller that initializes the app, attaches event listeners, and orchestrates calls between other modules. On page load, `main.js` will load stored data (profile, badges, etc.), update the UI accordingly (e.g. pre-fill username if known, render any persisted leaderboard or badge status), and set up the event handlers:

   * Form submission handler for the prompt form (calls `PromptEvaluator.reviewPrompt()` and then passes results to display).
   * Click handlers for nav buttons (to switch sections).
   * Click handlers for copy/download buttons on the Review screen.
   * Handlers for leaderboard filter toggle.
   * Back button handlers for Leaderboard and Achievements sections.
   * Possibly handler for reset data if we include that option.

   `main.js` also will handle showing/hiding sections (like a simple function `showSection('home')` that sets appropriate display styles). It coordinates retrieving and updating localStorage via the Data module and calling the AI module. It’s essentially the glue of the application.

2. **dataManager.js:** This module abstracts all interactions with LocalStorage and the CSV log. It provides functions like:

   * `loadProfile()`, `saveProfile(profileObj)`
   * `loadHistory()`, `saveHistory(historyArray)` (though we might not need to save the whole array each time if we append, but for simplicity, rewriting might be okay).
   * `addHistoryEntry(entry)` – to add a new prompt result to history (and internal global log if needed).
   * `loadLeaderboardData()` – returns an array of entries from either localStorage JSON or by parsing the CSV string.
   * `saveLeaderboardData(array)` or `appendLeaderboardEntry(entry)` – to update the leaderboard data. In the append case, it should both update the JSON and the CSV string and store both.
   * `loadBadges()`, `saveBadges(badgeObj)`
   * `loadKnowledgeGraph()`, `saveKnowledgeGraph(graphObj)`
   * `resetAll()` – clears all relevant keys (for a data reset feature).

   By centralizing these, the rest of the app doesn’t directly call `localStorage.setItem` etc., but goes through this module. This makes it easier if we ever change how data is stored (for instance, if we later use IndexedDB or something for larger data, or if we integrate a backend in future, it’s one place to change logic).

3. **uiRenderer.js:** This module focuses on updating the DOM. It contains functions to render certain components given data:

   * `showPromptResult(resultObj)` – populates the Review screen elements with the data from a prompt evaluation (score, breakdown, suggestions, improved prompt). It will construct innerHTML for breakdown and suggestions list for example.
   * `updateLeaderboardView(entriesArray, filter)` – populates the leaderboard table. It takes the array of leaderboard entries (all or filtered) and rebuilds the `<tbody>` rows, and updates the “Your rank” text. It might also accept a filter parameter (like `"global"` or `"regional"`) or the function can be called separately for each view.
   * `updateProfileDisplay(profileObj)` – fills in the spans on Achievements screen with name, contact, etc.
   * `updateBadgesDisplay(badgesObj)` – sets classes on each badge element (add `unlocked` class if true, etc.). Possibly also could visually animate a new badge unlocking.
   * `showNotification(message)` – could be a small utility to display a temporary banner or modal with a message (like badge unlocked or error messages).
   * `toggleLoading(state)` – to show or hide a loading indicator (e.g. disable form and show spinner while waiting for GPT). Perhaps this just adds/removes a CSS class on the submit button or an overlay.

   Essentially, `uiRenderer` takes care that whenever data changes, the UI reflects it. `main.js` will call these after getting data from `dataManager` or results from `PromptEvaluator`.

4. **PromptEvaluator (aiEvaluator.js):** This module handles the AI evaluation using GPT-4.1. It will likely have:

   * **`reviewPrompt(promptText, promptType)`**: the main function that orchestrates calling GPT and returns a structured result. It might return a Promise (since the API call is asynchronous) or use async/await. The result is an object containing everything needed (score, breakdown, suggestions, improved prompt, identified topics/entities maybe). Format might be:

     ```js
     {
       score: 78,
       criteria: { Clarity:4, Specificity:3, Structure:5, ... },
       suggestions: [
         "Add more details about the context",
         "Specify the output format (e.g., bullet points)",
         "Provide an example input to guide the response"
       ],
       improvedPrompt: "Here goes the GPT's rewritten prompt ...",
       topics: ["quantum computing","technology"],
       entities: ["AI","healthcare"],
       styleFeatures: ["persona_specified","structured_format"]
     }
     ```

   * Internally, `reviewPrompt` will formulate the API call. For example, it will prepare a **system message** for GPT that defines its role: *“You are an expert prompt analyst. You will receive a prompt and its intended use-case. Analyze the prompt for clarity, specificity, structure, completeness, etc., and suggest improvements. Follow OpenAI’s best practices in your critique. Provide a score out of 10 and a revised improved prompt.”* Then a user message with the actual prompt content and type. And perhaps some guidelines: *“Reply in JSON with fields: score, breakdown, suggestions, improved\_prompt, topics, entities.”*

     * We’ll instruct GPT-4.1 to output a JSON so our app can easily parse it. GPT-4.1 is quite capable of structured output. Alternatively, it could output markdown that we parse, but JSON is straightforward.
     * For example, we might send something like this via the API:

       ```
       System: "You are an AI assistant that evaluates user prompts for quality. You have the OpenAI Prompting Guide knowledge. When given a prompt and its use case, you will analyze it on criteria: Clarity, Specificity, Structure, Completeness, ... etc. You will also provide an overall score from 1 to 10, a list of improvement suggestions, and a rewritten improved version of the prompt. If possible, identify key topics and named entities in the prompt as well. Respond ONLY in a JSON format with keys: criteria_ratings, score, suggestions, improved_prompt, topics, entities."
       User: { "prompt": "<<user prompt here>>", "type": "<<Chatbot/Coding/etc>>" }
       ```

       This is an approximation; the actual prompt might not be JSON since we can't ensure GPT will parse JSON input, maybe simpler:

       ```
       User: "PROMPT TYPE: <Chatbot>\nPROMPT: <the prompt text>\n\n(Analyze the prompt as per instructions...)"
       ```

       Then GPT outputs a JSON in its assistant message.

   * The module will handle calling the OpenAI API endpoint (likely `https://api.openai.com/v1/chat/completions` if using OpenAI’s API). It will need the API key. Since this is client-side, embedding an API key is risky (exposed). But in a testing scenario or an internal environment like Cursor, perhaps they can include their key manually. Alternatively, to truly simulate without a key, we might run in a mode where `PromptEvaluator` doesn’t call the API but instead uses a placeholder or a local stub function that returns a dummy result (for development without charges or offline). We can incorporate a flag like `USE_GPT_API = false` for simulation mode. In simulation, for example, we could just generate a random score and some static suggestions as placeholders. This way the developers can test the UI flow without needing the actual GPT response. The PRD instructs to plan for “simulate GPT-4.1 usage” in a local environment, so we will explicitly mention how to structure that.

   * **API Integration:** If using real API, the developer will insert their OpenAI API key (maybe through a config or prompt). The request will include model `"gpt-4-1"` (if that’s how GPT-4.1 is accessed, possibly as `gpt-4` with certain parameters if 4.1 is not a separate name), and the composed messages as described. The module will parse the JSON from the assistant’s response. We need to ensure robust JSON parsing – GPT sometimes might produce extra text around JSON. We can either instruct it firmly or parse out the first `{ ... }` in the response.

   * **Error Handling:** If the API call fails (network error or invalid JSON), the module should throw or return an error that `main.js` can catch. Then `uiRenderer.showNotification("Error contacting AI service")` could alert the user. Possibly also handle rate limit issues by telling user to slow down or something.

5. **badgeManager.js (optional):** Badge logic could be its own module or part of main. But to encapsulate:

   * It can hold the list of badge definitions (id, name, description, icon, condition checking function perhaps).
   * Provide `evaluateBadges(lastResult, previousResultData)` which goes through each badge and uses current state to decide unlocks.
   * The conditions might need access to history (for streaks), profile (for region rank), etc., which can be passed in or imported from dataManager.
   * It then returns a list of newly unlocked badges, or directly updates data and calls UI update for badges.
   * This separation is neat, but could also just live in main for simplicity if preferred.

6. **knowledgeGraphManager.js (optional):** Similar idea: a module to handle extracting and updating the semantic graph. Possibly:

   * `extractKnowledge(promptText, feedback)` that returns {topics: \[...], entities: \[...], styleFeatures: \[...]}. This could use simple heuristics or even call a simpler AI model. But likely we can partially rely on GPT output (we asked it for topics/entities).
   * `updateKnowledgeGraph(extractedData)` which merges the new topics/entities with counts in `PRT_KnowledgeGraph`.
   * Could also have a method to maybe visualize or output something but that’s beyond initial scope.

All these modules will be integrated. In terms of file structure, something like:

```
js/
  main.js
  dataManager.js
  uiRenderer.js
  promptEvaluator.js
  badgeManager.js
  knowledgeGraph.js
styles.css
index.html
```

This keeps things organized.

### API Structure for Local AI Prompt Review (GPT-4.1 Simulation)

We detail how the app will simulate or call GPT-4.1 for evaluating prompts:

In **development or offline mode**, we’ll implement `PromptEvaluator.reviewPrompt` to use a stub. For example, if no API key is configured, the function can immediately return a dummy `resultObj` such as:

```js
{
  score: Math.floor(Math.random()*40) + 60, // random 60-99
  criteria: { Clarity:3, Specificity:4, Structure:3, ... }, 
  suggestions: ["This is a placeholder suggestion to improve your prompt."],
  improvedPrompt: promptText, // just echo for now or slight modification
  topics: [], entities: [], styleFeatures: []
}
```

This would allow the UI to be tested end-to-end. We will clearly label in code comments that this is dummy logic.

In **production mode** (with API access), the structure will be:

* Use `fetch` or an AJAX call to OpenAI’s API. Set up the request with necessary headers (`Authorization: Bearer <API_KEY>`, content-type application/json).
* The request body:

  ```json
  {
    "model": "gpt-4-0613", 
    "messages": [
       {"role": "system", "content": "...prompt analysis instructions..."},
       {"role": "user", "content": "... user prompt and type ..."}
    ],
    "temperature": 0,  // for deterministic analysis
    "max_tokens": 500, // to allow detailed output
    "n": 1
  }
  ```

  *Note:* We set `temperature` to 0 for consistency – we want the same prompt to yield the same feedback if repeated, reducing randomness in scoring. `max_tokens` should be high enough for breakdown + improved prompt (500 tokens or more).
* Parse the JSON from `response.choices[0].message.content`.
* Because we instructed the model to output JSON, ideally `content` starts with `{` and is directly parseable. If the model sometimes adds text before or after, we can regex extract the JSON. (We will mention careful parsing.)
* Then fill our `resultObj`:

  * `score` from the JSON (the model might give it as “8” or “8.0” which we multiply by 10 if we want /10 or /100).
  * `criteria` object (the model could provide one, or it might list breakdown in text – better to ask it to output each criterion rating in a JSON object).
  * `suggestions` (an array of strings).
  * `improvedPrompt` (string).
  * `topics`, `entities` arrays if provided.
* Return that to the caller.

**Security**: We have to be mindful that exposing the API key in a client app is not secure. If this tool is for personal/educational use, the user can input their API key on launch (prompt with a dialog) and we store it in a variable (not in localStorage ideally, or if we do, warn user). For now, in PRD, we can say *“The developer should integrate a secure method for API key usage, such as prompting the user for their OpenAI API key at runtime (which is not saved), or instructing them to set an environment variable if running locally.”* In a zero-shot environment like Cursor, the key might be in an environment config and the calls are server-side. But since here it’s client, likely just a prompt to user to paste key each session (inconvenient but secure). This detail can be noted.

To summarize, the **API module interface** is straightforward: one function `reviewPrompt(promptText, promptType)` that returns a Promise for the result object. If simulation mode, it resolves quickly with dummy data; if live mode, it awaits the fetch to OpenAI. The rest of the app (main) doesn’t need to know the difference.

Finally, we ensure the app is structured to be built quickly:

* We will use plain JavaScript (ES6+).
* We might decide whether to use any libraries. Given the constraint “HTML, CSS, JS only”, likely no frameworks. We will rely on vanilla JS for DOM and fetch.
* If needed, a small library for CSV could be used, but generating CSV is so simple that it’s not needed. Likewise, no need for a big graph library for knowledge graph in this scope (unless visualization was wanted, which it isn’t explicitly).

### Example Flow (Putting it all together)

To illustrate the system working end-to-end, consider a typical user story:

1. **Open App:** User opens the HTML page. `main.js` initializes, loads any saved profile. Suppose first time: user enters “Alice AI” and chooses “North America”. They type a prompt “Translate this paragraph into French.” and select type “Chatbot”.
2. **Submit Prompt:** The form triggers `main.handleSubmit()`. This gathers inputs, calls `PromptEvaluator.reviewPrompt("Translate this paragraph...", "Chatbot")`. `uiRenderer.toggleLoading(true)` might show a spinner.
3. **GPT Evaluation:** The `PromptEvaluator` module sends request to OpenAI. It includes instructions for evaluation – e.g. GPT might respond with JSON:

   ```json
   {
     "criteria_ratings": {"Clarity": 5, "Specificity": 4, "Structure": 3, "Completeness": 3},
     "score": 7.5,
     "suggestions": [
       "Specify the format of the translation (casual vs formal tone).",
       "Include the original text explicitly or context about it if needed."
     ],
     "improved_prompt": "You are a translator. Translate the following English paragraph into French in a formal tone:\n\n<paragraph here>\n\nProvide the French translation only.",
     "topics": ["translation", "language"],
     "entities": [],
     "style_features": ["persona_specified"]
   }
   ```
4. **Receive Results:** The response is parsed into `resultObj`. `main.js` receives it (perhaps via `await`).
5. **Update Data:** `main.js` calls `dataManager.addHistoryEntry(resultObj combined with prompt text, user info)`. Also `dataManager.appendLeaderboardEntry({user:"Alice AI", continent:"NA", score:75, type:"Chatbot", ...})`. Also updates knowledge graph via `knowledgeGraph.update(extracted topics/entities/styles)`. Then calls `badgeManager.evaluateBadges(...)` – for example, Alice might unlock *Clarity Champion* because clarity was 5/5, so that returns \["clarity\_champ"]. We update badges data and note a new badge.
6. **Render UI:** `main.js` now calls `uiRenderer.showPromptResult(resultObj)` to display the Review section with all the info. It also hides the Home section. `uiRenderer.updateBadgesDisplay()` might be called if a badge was unlocked (or we trigger a popup “New Badge!”). The loading indicator is turned off.
7. **User sees results:** Alice sees score 75/100, sees suggestions to add more context. The improved prompt shows a structured approach. She clicks “New Prompt”.
8. **Next Prompt:** She maybe uses the improved prompt and adds even more detail, gets a higher score, unlocking a streak badge eventually, etc. The leaderboard now has her best score updated if improved.
9. **View Leaderboard:** She clicks Leaderboard, `main.js` triggers `dataManager.loadLeaderboardData()` and `uiRenderer.updateLeaderboardView()` to show her rank (maybe #1 with 80 now, etc.).
10. **Achievements:** She sees she has Clarity Champion badge highlighted in Achievements.

Through this flow, all pieces interact as specified.

The architecture ensures that developers can start coding each module independently:

* They can create the static HTML and CSS layout from the UI spec.
* Implement `dataManager` functions to get/set localStorage (straightforward).
* Implement `uiRenderer` to manipulate DOM as needed (testable with dummy data).
* Implement `PromptEvaluator` stub first (for testing UI without API), then add real API call.
* Implement `badgeManager` rules.
* Finally test the flows together.

All without server setup.

## Conclusion and Further Considerations (Optional)

*(This section is not explicitly requested, but could summarize key points or next steps.)*

In summary, the Prompt Review Tool PRD provides a comprehensive blueprint for a client-only web app that helps users iteratively improve their AI prompts. By combining GPT-4.1’s analytical power with proven prompt engineering guidelines, the tool not only scores prompts but educates the user on how to write better prompts – a critical skill in effective AI usage. The product also incorporates gamification (leaderboards and badges) to make the learning process engaging and rewarding.

Developers can proceed to implement this design immediately. The modular structure (UI, data storage, AI evaluation, etc.) ensures clarity in development and ease of maintenance. Special care should be given to the prompt sent to GPT-4.1 for evaluation, as it directly influences the quality of feedback. Using OpenAI’s prompting guide as the backbone, as we have outlined, should yield excellent results in identifying prompt strengths and weaknesses.

**Future enhancements:** Once the core is working, we might consider additional features like: a visual representation of the knowledge graph (showing the user a map of topics they’ve explored and techniques used), more granular analytics (like average score per category, or tracking improvement over time with charts), and community features (if backend is introduced, truly global leaderboards across users). Integration with external platforms (e.g., one-click share of a badge to LinkedIn) could further increase the tool’s appeal.

For now, this PRD covers the foundation needed to build the Prompt Review Tool in a zero-shot manner. Following these specifications, developers should be able to create a functional MVP that can run in a browser and empower users to become better prompt engineers through interactive practice and AI-driven guidance.
