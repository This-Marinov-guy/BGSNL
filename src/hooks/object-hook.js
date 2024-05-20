import { useParams } from "react-router-dom";

// takes the eventId which is a title from the url and returns the event 
export const useObjectGrabUrl = (array) => {
  const { eventId } = useParams();

  let target;

  for (let i = 0; i < array.length; i++) {
    if (array[i].title === eventId) {
      target = array[i];
      break;
    }
  }

  if (!target) {
    window.location.replace(process.env.REACT_PUBLIC_URL + '/404');
  }

  return target;
};
