import React, { createContext, useContext, useState } from 'react';

const RatingContext = createContext();

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState(null);

  const triggerRatingModal = (data) => {
    setRatingData(data);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRatingData(null);
  };

  return (
    <RatingContext.Provider value={{
      showRatingModal,
      ratingData,
      triggerRatingModal,
      closeRatingModal
    }}>
      {children}
    </RatingContext.Provider>
  );
}; 