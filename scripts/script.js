import axios from "./libs/axios.js";


let hold = {}
let questions;

async function getQuestions() {
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=50&category=9&type=multiple');

        const difficulty = {
            easy: 1,
            medium: 2,
            hard: 3
        };

        questions = response.data.results.filter(element => !element.question.includes("&") && !element.correct_answer.includes("&") && !element.incorrect_answers.some(answer => answer.includes("&")));

        questions.sort((a, b) => difficulty[a.difficulty] - difficulty[b.difficulty])

        console.log(questions);
    }
    catch (error) {
        console.error(`Getting questions: ${error}`);
    }

    function askQuestion() {
        current = questions.pop();
        quesEle.innerText = current.question;
    }



}


getQuestions()
