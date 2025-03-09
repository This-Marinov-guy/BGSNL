import React, { useState, useEffect } from "react";
import {
  createCustomerTicket,
  createQrCodeCheckGuest,
} from "../../util/functions/ticket-creator";
import { decryptData } from "../../util/functions/helpers";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import CardInputs from "../../elements/inputs/common/CardInputs";
import InternshipCard from "../../elements/ui/cards/InternshipCard";
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";

const TEST = [
  {
    title: "Belotte Tournament",
    description: "Join us for a fun evening of Belotte!",
    price: 5,
  },

  {
    title: "Belotte Tournament",
    description: "Join us for a fun evening of Belotte!",
    price: 5,
  },

  {
    title: "Belotte Tournament",
    description: "Join us for a fun evening of Belotte!",
    price: 5,
  },
];

const BloggerPost = ({ blogId, postId }) => {
  const [postData, setPostData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await fetch(
          `https://public-api.wordpress.com/wp/v2/sites/${blogId}/posts/${postId}?_embed`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setPostData(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
        setError("Error loading blog post.");
      }
    };

    fetchBlogPost();
  }, [blogId, postId]);

  const processContent = (content) => {
    // Replace http with https
    let processedContent = content.replace(/http:\/\//g, "https://");

    // Fix relative image paths
    processedContent = processedContent.replace(
      /src="\/wp-content/g,
      `src="https://public-api.wordpress.com/wp/v2/sites/${blogId}/wp-content`
    );

    return processedContent;
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!postData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="contaner">
      <h1 dangerouslySetInnerHTML={{ __html: postData.title.rendered }} />
      {postData._embedded && postData._embedded["wp:featuredmedia"] && (
        <img
          src={postData._embedded["wp:featuredmedia"][0].source_url}
          alt={
            postData._embedded["wp:featuredmedia"][0].alt_text ||
            "Featured image"
          }
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
      <div
        className="post-content wp-content"
        dangerouslySetInnerHTML={{
          __html: processContent(postData.content.rendered),
        }}
      />
    </div>
  );
};

const TicketComponent = () => {
  return (
    <div style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between flex-wrap gap-3">
        <InternshipCard internship={INTERNSHIPS_LIST[0]} />
        <InternshipCard internship={INTERNSHIPS_LIST[0]} />
        <InternshipCard internship={INTERNSHIPS_LIST[0]} />
      </div>
    </div>
  );
};

export default TicketComponent;
