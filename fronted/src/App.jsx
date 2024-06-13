import React, { useEffect, useState } from 'react';
import axios from 'axios';
function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/jokes')
      .then((response) => { 
        setJokes(response.data);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  return (
    <>
      <h1 className='heading'>Jokes and Story Teller</h1>
      <div className='number_jokes'>JOKES: {jokes.length}</div>
      {jokes.map((joke, index) => (
        <div className="box" key={index}>
          <h2 className='heading2'>{joke.title}</h2>
          <p className='jokes'>{joke.content}</p>
        </div>
      ))}
    </>
  );
}

export default App;
