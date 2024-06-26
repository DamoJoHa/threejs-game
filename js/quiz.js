async function newQuestion(form, formLayer) {
  const question = document.getElementById("question-text")
  const correctAnswer = randPosition()
  console.log("correct: ", correctAnswer)
  // grab question data and fill into form
  setTimeout(() => {
    "hello"
  }, 2000);
  await fetch("https://opentdb.com/api.php?amount=1&type=multiple&encode=base64")
    .then(response => {
      return response.json()
    })
    .then(data => {
      question.innerText = window.atob(data.results[0].question)
      let index = 0;
      for (let i = 0; i < 4; i++) {
        let option
        if (i === correctAnswer) {
          option = window.atob(data.results[0]["correct_answer"])
        } else {
          option = window.atob(data.results[0]["incorrect_answers"][index])
          index++
        }
        document.getElementById(`question-answer-${i}`).innerText = option
      }
    })

  // toggle form layer visibility
  formLayer.style.display = "flex"


  // returns 0, 1, 2, or 3
  function randPosition() {
    return Math.floor((Math.random() * 4))
  }

  return(correctAnswer)
}




export default newQuestion
