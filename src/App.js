// ----- Imports ----- //

import { click } from "@testing-library/user-event/dist/click";
import { useEffect, useState } from "react";

// ----- Example data ----- //

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

// ----- Helper functions ----- //

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// ----- App Main ----- //

const KEY_API = "76932c8";

export default function App() {
  const [query, setQuery] = useState("Inception");
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // const query = `golf`;

  // using useEffect hook
  useEffect(
    function () {
      // the useEffect callback is synchronous to prevent race conditions, so it can not return a promise
      // for this reason passing new asynch function inside fetchMovies()
      // wrap asynch func inside try catch block to get errors

      async function fetchMovies() {
        try {
          // loading state is ON
          setIsLoading(true);

          // Resetting error
          setErrorMessage("");

          // try to fetch data
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY_API}&s=${query}`
          );

          // guard clause (for fetching)
          if (!response.ok)
            throw new Error("Something went wrong wuth fetching movies...");

          // if response is ok convert from json
          const data = await response.json();

          // guard clase (if there is no movie ofr query)
          if (data.Response === "False") {
            throw new Error("Movie not found...");
          }

          // if everything is ok update movies state
          setMovies(data.Search);
        } catch (err) {
          setErrorMessage(() => err.message);
        } finally {
          // loading state is OFF
          setIsLoading(false);
        }
      }

      if (query.length < 3) return;
      // indeed also call the asynch function
      fetchMovies();
    },
    // arrau with a list of dependencies which, when change, will run the effect
    // NOTE: every state variable and prop used inside the effect MUST be included in the dependency array
    [query]
  );

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <SearchResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MoviesList movies={movies} />} */}
          {isLoading && <Loader />}
          {errorMessage && <ErrorMessage errMessage={errorMessage} />}
          {!isLoading && !errorMessage && <MoviesList movies={movies} />}
        </Box>

        <Box>
          <WatchedMoviesSummury watchedMovies={watched} />
          <WatchedMoviesList watchedMovies={watched} />
        </Box>
      </Main>
    </>
  );
}

// ----- Components ----- //

function ErrorMessage({ errMessage }) {
  return (
    <p className="error">
      <span>⛔</span>
      {errMessage}
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <MovieItem movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function MovieItem({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesSummury({ watchedMovies }) {
  const avgImdbRating = average(watchedMovies.map((movie) => movie.imdbRating));
  const avgUserRating = average(watchedMovies.map((movie) => movie.userRating));
  const avgRuntime = average(watchedMovies.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watchedMovies.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watchedMovies }) {
  return (
    <ul className="list">
      {watchedMovies.map((movie) => (
        <WatchedMovieItem movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovieItem({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
