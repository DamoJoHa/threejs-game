async function newQuestion() {
  const form = document.getElementById("question-form")
  const formLayer = document.getElementById("question-layer")
  const question = document.getElementById("question-text")
  const correctAnswer = randPosition()

  // grab question data and fill into form
  await fetch("https://opentdb.com/api.php?amount=1")
    .then(response => {
      return response.json()
    })
    .then(data => {
      question.innerText = data.results[0].question
      let index = 0;
      for (let i = 0; i < 4; i++) {
        let option
        if (i === correctAnswer) {
          option = data.results[0]["correct_answer"]
        } else {
          option = data.results[0]["incorrect_answers"][index]
          index++
        }
        document.getElementById(`question-answer-${i}`).innerText = option
      }
    })

  // toggle form layer visibility
  formLayer.style.display = "flex"

  // hijack submitted data and conditionally assign points
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form)
    console.log(JSON.parse(data.body))
  })
}

// returns 0, 1, 2, or 3
function randPosition() {
  return Math.floor((Math.random() * 4))
}

export default newQuestion
