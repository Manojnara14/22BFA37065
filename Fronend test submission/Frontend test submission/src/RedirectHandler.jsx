import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

function RedirectHandler() {
  const { shortcode } = useParams();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/url/${shortcode}`);
        const data = await res.json();
        if (data && data.originalUrl) {
          window.location.href = data.originalUrl; // Redirect to original URL
        } else {
          alert("URL not found");
        }
      } catch (err) {
        console.error("Error during redirection:", err);
        alert("Something went wrong during redirection.");
      }
    };

    fetchAndRedirect();
  }, [shortcode]);

  return <p>Redirecting...</p>;
}

export default RedirectHandler;
