import React, { useState } from 'react'
import Loader from '../ui/loading/Loader'

const GifSearch = (props) => {

    const [timer, setTimer] = useState()
    const [keyword, setKeyword] = useState('')
    const [renderedGifs, setRenderedGifs] = useState(null)
    const [selectedGifUrl, setSelectedGifsUrl] = useState('');
    const [loading, setLoading] = useState(false)

    const apiKey = process.env.REACT_APP_GIPHY;
    const searchEndPoint = "https://api.giphy.com/v1/gifs/search?";
    const limit = 12;

    const showGif = (json) => {
        setRenderedGifs(json.data.map(gif => gif.id)
            .map(gifId => {
                return `https://media.giphy.com/media/${gifId}/giphy.gif`;
            }))
    }

    const searchGif = (kw) => {
        setLoading(true)
        clearTimeout(timer)
        setTimer(setTimeout(() => {
            fetch(`${searchEndPoint}&api_key=${apiKey}&q=${kw
                }&limit=${limit}`)
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    showGif(json)
                    setLoading(false)
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false)
                });
        }, 500))

    }

    const handleGifSelect = (gif) => {
        setSelectedGifsUrl(gif)
        props.setValue(gif)
        setKeyword('')
        setRenderedGifs(null)
    }

    return (
        <div className="col-lg-12 col-md-12 col-12 mt--20">
            <div className="rn-form-group">
                <label
                    style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        display: "block",
                        color: "#6c757d"
                    }}
                >
                    Search GIF (Optional)
                </label>
                <input 
                    type="text" 
                    value={keyword}
                    placeholder={selectedGifUrl ? "GIF selected! Search for another..." : "Search for GIFs (e.g., christmas, happy, holiday)"} 
                    onChange={(event) => { 
                        searchGif(event.target.value); 
                        setKeyword(event.target.value);
                        if (event.target.value === '') {
                            setRenderedGifs(null);
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "16px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease"
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = "#017363";
                        e.target.style.boxShadow = "0 0 0 3px rgba(1, 115, 99, 0.1)";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "#e9ecef";
                        e.target.style.boxShadow = "none";
                    }}
                />
                
                {selectedGifUrl && (
                    <div style={{
                        marginTop: "15px",
                        padding: "12px",
                        backgroundColor: "#d4edda",
                        border: "1px solid #c3e6cb",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <img 
                            src={selectedGifUrl} 
                            alt="Selected GIF" 
                            style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "2px solid #28a745"
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: "#155724", fontWeight: "500", fontSize: "14px" }}>
                                GIF Selected ✓
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedGifsUrl('');
                                    props.setValue('');
                                }}
                                style={{
                                    marginTop: "4px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    color: "#dc3545",
                                    backgroundColor: "transparent",
                                    border: "1px solid #dc3545",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#dc3545";
                                    e.target.style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = "#dc3545";
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{
                        marginTop: "20px",
                        padding: "40px",
                        textAlign: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef"
                    }}>
                        <Loader />
                        <p style={{ marginTop: "15px", color: "#6c757d", fontSize: "14px" }}>
                            Searching for GIFs...
                        </p>
                    </div>
                )}

                {(keyword && !loading && renderedGifs && renderedGifs.length > 0) && (
                    <div style={{
                        marginTop: "20px",
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef"
                    }}>
                        <p style={{
                            margin: "0 0 15px 0",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#495057"
                        }}>
                            Select a GIF:
                        </p>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: "12px",
                            maxHeight: "400px",
                            overflowY: "auto",
                            padding: "5px"
                        }}>
                            {renderedGifs.map((gif, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleGifSelect(gif)}
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "2px solid transparent",
                                        transition: "all 0.2s ease",
                                        aspectRatio: "1",
                                        backgroundColor: "#fff"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#017363";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(1, 115, 99, 0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "transparent";
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <img 
                                        src={gif} 
                                        alt={`GIF ${index + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block"
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(keyword && !loading && renderedGifs && renderedGifs.length === 0) && (
                    <div style={{
                        marginTop: "20px",
                        padding: "30px",
                        textAlign: "center",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "8px"
                    }}>
                        <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>
                            No GIFs found. Try a different search term!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GifSearch