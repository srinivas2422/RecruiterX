import { BriefcaseBusinessIcon, Calendar, Code2Icon, Component, LayoutDashboard, List, Puzzle, Settings, User2Icon,  WalletCards } from "lucide-react";

export const SideBarOptions = [
    {
        name : 'Dashboard',
        icon : LayoutDashboard,
        path : '/dashboard'
    },
    {
        name : 'Scheduled Interview',
        icon : Calendar,
        path : '/scheduled-interview'
    },
    {
        name : 'All Interview',
        icon : List,
        path : '/all-interview'
    },
    {
        name : 'Billing',
        icon : WalletCards,
        path : '/billing'
    },
    {
        name : 'Settings',
        icon : Settings,
        path : '/settings'
    },
]

export const InterviewType = [
    {
        title: 'Technical',
        icon: Code2Icon
    },
    {
        title: 'Behavioral',
        icon: User2Icon
    },
    {
        title: 'Experience',
        icon: BriefcaseBusinessIcon
    },
    {
        title: 'Problem Solving',
        icon: Puzzle
    },
    {
        title: 'Leadership',
        icon: Component
    },
]

export const QUESTIONS_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}

Job Description: {{jobDescription}}

Interview Duration: {{duration}}

Interview Type: {{type}}

📌 Your task:

Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration.
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.

🧩 Format your response in JSON format with array list of questions.
format: interviewQuestions = [
{
  question: "",
  type: {{type}}
},
{
  ...
}
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role.
`

export const FEEDBACK_PROMPT = `
You are a senior technical interviewer.

You are evaluating a candidate based on a real interview.

========================
JOB DETAILS:
Role: {{jobPosition}}
Interview Type: {{interviewType}}
Job Description: {{jobDescription}}
========================

========================
CONVERSATION:
{{conversation}}
========================

Your task is to evaluate the candidate strictly and realistically, like a real interviewer.

⚠️ IMPORTANT RULES:
- Be strict, not polite
- Do NOT give high scores for vague or generic answers
- Penalize incorrect or incomplete explanations
- Evaluate ONLY based on the candidate’s responses
- Consider the expectations of the given role and interview type

----------------------------------

EVALUATION CRITERIA:

1. Technical Skills
- Accuracy of concepts relevant to the role
- Depth of explanation
- Correct use of terminology
- Understanding of tools/technologies (based on job description)

2. Communication
- Clarity of explanation
- Structure of answers
- Ability to explain complex ideas simply

3. Problem Solving
- Logical thinking
- Step-by-step explanation
- Ability to approach real-world scenarios

4. Experience
- Practical knowledge
- Real-world exposure
- Confidence and clarity in answers

----------------------------------

Also analyze:

✅ Strengths (what candidate did well)  
❌ Weaknesses (where candidate lacked)  
⚠️ Missing Knowledge Areas (important gaps based on job role)

----------------------------------

SCORING RULES:
- 9–10 → Excellent (production-level, deep knowledge)
- 7–8 → Good (minor gaps)
- 5–6 → Average (basic understanding, lacks depth)
- 3–4 → Weak (many gaps, shallow answers)
- 0–2 → Poor (incorrect or no understanding)

----------------------------------

Return STRICT JSON format:

{
  "feedback": {
    "rating": {
      "technicalSkills": <0-10>,
      "communication": <0-10>,
      "problemSolving": <0-10>,
      "experience": <0-10>
    },
    "strengths": ["point1", "point2"],
    "weaknesses": ["point1", "point2"],
    "missingSkills": ["point1", "point2"],
    "summary": "<exactly 3 lines>",
    "recommendation": "YES or NO",
    "recommendationMsg": "<clear hiring decision in 1 line>"
  }
}

⚠️ FINAL INSTRUCTIONS:
- Do NOT return anything outside JSON
- Keep summary strictly 3 lines
- Recommendation must be decisive (NO maybe)
`;