import React, { useState } from "react";

// Genererer 50 oppgaver for å gjøre koden stor
const initialTodos = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  text: `Oppgave ${i + 1}`,
  completed: Math.random() > 0.5,
}));

const HugeComponent = () => {
  const [todos, setTodos] = useState(initialTodos);

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  return (
    <div>
      <h1>Altfor stor komponent! 🚀</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            {todo.text}
          </li>
        ))}
      </ul>

      {/* Masse unødvendig JSX for å overstige 400 linjer */}
      <div className="extra-content">
        <section>
          <h2>Ekstra seksjon 1</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 2</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 3</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 4</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 5</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 6</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 7</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 8</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 9</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 10</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 11</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 12</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 13</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 14</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 15</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 1</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 2</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 3</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 4</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 5</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 6</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 7</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 8</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 9</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 10</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 11</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 12</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 13</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 14</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 15</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 1</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 2</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 3</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 4</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 5</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 6</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 7</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 8</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 9</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 10</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 11</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 12</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 13</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 14</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 15</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>

        <section>
          <h2>Ekstra seksjon 1</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 2</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 3</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 4</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 5</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 6</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 7</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 8</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 9</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 10</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 11</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 12</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 13</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 14</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 15</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje jadda...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 13</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 14</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje...</p>
        </section>
        <section>
          <h2>Ekstra seksjon 15</h2>
          <p>Dette er masse ekstra tekst for å gjøre filen stor.</p>
          <p>En til linje med tekst.</p>
          <p>Og enda en linje jadda...</p>
        </section>
      </div>
    </div>
  );
};

export default HugeComponent;
