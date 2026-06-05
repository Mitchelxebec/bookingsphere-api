export const getRatingLabel = (rating: number): string => {
  switch (true) {
    case !rating:
      return "No rating";
    case rating >= 9:
      return "Exceptional";
    case rating >= 8:
      return "Very Good";
    case rating >= 7:
      return "Good";
    default:
      return "Pleasant";
  }
};
