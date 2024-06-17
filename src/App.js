// ----- Imports ----- //

import { click } from "@testing-library/user-event/dist/click";
import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRatingComponent";

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
  // ----- STATE ----- //

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  // passing a callback (don't calling it) to get the initial state from local
  const [watched, setWatched] = useState(function () {
    const localMoviesSTR = localStorage.getItem("watchedMovies");
    return JSON.parse(localMoviesSTR);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentMovieId, setCurrentMovieId] = useState(null);

  // ----- HANDLER FUNCTIONS ----- //

  function handleRemoveWatchedMovie(id) {
    setWatched((watchedMovies) =>
      watchedMovies.filter((movie) => movie.imdbID !== id)
    );
  }

  function handleSelectCurrentMovieId(newId) {
    setCurrentMovieId((currentId) => (currentId === newId ? null : newId));
    // console.log(currentMovieId);
  }

  function handleCloseCurrentMovie() {
    setCurrentMovieId(null);
  }

  function handleAddWatchedMovie(newMovie) {
    setWatched((actualArray) => [...actualArray, newMovie]);
  }

  // ----- EFFECTS ----- //

  useEffect(
    function () {
      // storing into local storage the list of watched movies everytime state (watched) chages
      localStorage.setItem("watchedMovies", JSON.stringify(watched));
    },
    [watched]
  );

  // using useEffect hook
  useEffect(
    function () {
      // AbortController browser API
      const controller = new AbortController();

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
          // as second argument of fetch func passing the object with singal property connected to the controller (AbortController)
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY_API}&s=${query}`,
            { signal: controller.signal }
          );

          // guard clause (for fetching)
          if (!response.ok)
            throw new Error("Something went wrong wuth fetching movies...");

          // if response is ok convert from json
          const data = await response.json();

          // guard clause (if there is no movie from query)
          if (data.Response === "False") {
            throw new Error("Movie not found...");
          }

          // if everything is ok update movies state
          setMovies(data.Search);

          // also resetting error
          setErrorMessage("");
        } catch (err) {
          // setting error function only if error is different of AbortError caused when aborting the fetch in cleanup func
          if (err.name !== "AbortError") {
            setErrorMessage(() => err.message);
          }
        } finally {
          // loading state is OFF
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setErrorMessage("");
        return;
      }
      // indeed also call the asynch function
      fetchMovies();

      // returning the clean up function
      return function () {
        // aborting the fetch request inside the useEffect cleanup function using the AbortController
        // Remember: when the request is canceled JS sees it like an error, so adjusted try catch blocks
        controller.abort();
      };
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
          {!isLoading && !errorMessage && (
            <MoviesList
              onMovieSelect={handleSelectCurrentMovieId}
              movies={movies}
            />
          )}
        </Box>

        <Box>
          {currentMovieId ? (
            <MovieDetails
              movieId={currentMovieId}
              onCloseMovie={handleCloseCurrentMovie}
              onAddWatched={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMoviesSummury watchedMovies={watched} />
              <WatchedMoviesList
                watchedMovies={watched}
                onDeleteWatchedMovie={handleRemoveWatchedMovie}
              />
            </>
          )}
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
  // 1. creating a ref and passing 'null' as initial value (usually 'null' when working with DOM elements)
  const searchInputEl = useRef(null);

  // 3. using ref
  useEffect(
    function () {
      function callbackFn(e) {
        // if search field is already focused just return
        if (document.activeElement === searchInputEl.current) return;

        // when press Enter empty search field and focus on it
        if (e.code === `Enter`) {
          setQuery("");
          // searchInputEl.current = is the DOM element
          // calling focus() method on DOM element to automatically focus it on 1st render

          searchInputEl.current.focus();
        }
      }

      document.addEventListener(`keydown`, callbackFn);

      return () => {
        document.addEventListener(`keydown`, callbackFn);
      };
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      // 2. use 'ref' prop to connect a ref in a declarative way
      ref={searchInputEl}
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

function MoviesList({ movies, onMovieSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem
          onMovieSelect={onMovieSelect}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function MovieItem({ movie, onMovieSelect }) {
  return (
    <li onClick={() => onMovieSelect(movie.imdbID)}>
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watchedMovies, onDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watchedMovies.map((movie) => (
        <WatchedMovieItem
          movie={movie}
          key={movie.imdbID}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovieItem({ movie, onDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
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
        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function MovieDetails({ movieId, onCloseMovie, onAddWatched, watched }) {
  const [currentMovie, setCurrentMovie] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countChoiseRaiting = useRef(0);

  // change count of how many times user changes raiting before add film in the list
  useEffect(
    function () {
      if (userRating) countChoiseRaiting.current++;
    },
    [userRating]
  );

  const isMovieInList = watched.map((movie) => movie.imdbID).includes(movieId);

  const currentMovieUserRating = watched.find(
    (movie) => movie.imdbID === movieId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = currentMovie;

  useEffect(
    function () {
      async function fetchMovieDetails() {
        try {
          setErrorMessage("");
          setIsLoading(true);
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY_API}&i=${movieId}`
          );

          if (!response.ok)
            throw new Error("Something went wrong during the fetching data...");

          const data = await response.json();
          setCurrentMovie(data);
          // console.log(currentMovie);
        } catch (err) {
          setErrorMessage(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovieDetails();
    },
    [movieId]
  );

  useEffect(() => {
    // using hook to be able to use vanilla JS

    // declaring the callbakc function
    const callbackEsc = function (event) {
      if (event.code === `Escape`) {
        console.log(`escaping`);
        onCloseMovie();
      }
    };

    // attaching event listener
    document.addEventListener(`keydown`, callbackEsc);

    // returning a cleanup function to remove event listener,
    // overwise a new one will be attached everytime the component code runs
    return function () {
      document.removeEventListener(`keydown`, callbackEsc);
    };

    // adding the outside function as dependency
  }, [onCloseMovie]);

  // effect to change website title when title changes
  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    // clean up function to reset the website title
    return function () {
      document.title = `usePopcorn`;
    };
  }, [title]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: movieId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating,
      timesChangedChoiceRaiting: countChoiseRaiting.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            {/* <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div> */}

            <div className="rating">
              {!isMovieInList ? (
                <div className="rating">
                  <StarRating
                    numStars={10}
                    starSize={2.4}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 ? (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <p>{`You rated this movie ${currentMovieUserRating} ⭐️`}</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
