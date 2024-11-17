import React, { useState, useEffect } from "react";
import {
  createCustomerTicket,
  createQrCodeCheckGuest,
} from "../../util/functions/ticket-creator";
import { decryptData } from "../../util/functions/helpers";
import PhoneInput from "../../elements/inputs/common/PhoneInput";

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
    <div className="blogger-post" style={{ padding: "10px 5%" }}>
      <h1 dangerouslySetInnerHTML={{ __html: postData.title.rendered }} />
      {postData._embedded &&
        postData._embedded["wp:featuredmedia"] && (
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
  const [ticketDataUrl, setTicketDataUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateTicket = async () => {
      const ticketImage =
        "https://res.cloudinary.com/dqwcx5zyh/image/upload/v1731839045/groningen_Card%20Players_28%20Nov%206:30%20pm/ticket.jpg"; // Update this to the correct path
      const name = "John";
      const surname = "Doe";
      const qrLink = createQrCodeCheckGuest({
        eventId: "66f1337cd435689ec6ec0f4c",
        quantity: 2,
      });

      try {
        const { ticketUrl } = await createCustomerTicket(
          ticketImage,
          name,
          surname,
          "#faf9f6",
          qrLink,
          true,
          2
        );
        setTicketDataUrl(ticketUrl);
      } catch (err) {
        setError(err);
      }
    };

    generateTicket();
  }, []);

  return (
    <>
      <img src={ticketDataUrl} alt="Customer Ticket" />
      {/* <PhoneInput /> */}
    </>
  );
};

export default TicketComponent;
