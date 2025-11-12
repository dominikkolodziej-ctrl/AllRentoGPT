import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

const Rating = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") {
      alert("Wybierz ocenę i wpisz komentarz.");
      return;
    }
    setSubmitted(true);
  };

  const handleKey = useCallback((e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }, []);

  const Star = ({ starId, onMouseEnter, onMouseLeave, onClick, selected }) => (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Oceń na ${starId} ${starId === 1 ? "gwiazdkę" : "gwiazdki"}`}
      className={`text-3xl cursor-pointer ${selected ? "text-yellow-400" : "text-gray-400"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => handleKey(e, onClick)}
    >
      ★
    </span>
  );

  Star.propTypes = {
    starId: PropTypes.number.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-blue-700">Oceń Firmę</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((starId) => (
              <Star
                key={starId}
                starId={starId}
                onMouseEnter={() => setHoverRating(starId)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(starId)}
                selected={hoverRating >= starId || rating >= starId}
              />
            ))}
          </div>

          <label htmlFor="rating-comment" className="sr-only">
            Komentarz
          </label>
          <textarea
            id="rating-comment"
            placeholder="Komentarz..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Komentarz do oceny"
          />

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full">
            Wyślij ocenę
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-600">Dziękujemy za Twoją opinię!</h2>
          <p className="text-gray-500">Twoja ocena: {rating} / 5</p>
          <p className="text-gray-500 italic">„{comment}”</p>
        </div>
      )}
    </div>
  );
};

export default Rating;
