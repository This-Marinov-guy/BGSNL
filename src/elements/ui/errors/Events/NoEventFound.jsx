import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import React from 'react'
import { useNavigate } from "@/util/navigation"
import HeaderTwo from '../../../../component/header/HeaderTwo'
import ImageFb from '../../media/ImageFb'

const NoEventFound = () => {
    const navigate = useNavigate();

    return (
        <>
            <HeaderTwo />
            <div className="ver_section mt--200">
                <ImageFb
                    className="mr--40 logo-md"
                    src="/assets/images/avatars/no-event-found.png"
                    alt="Logo"
                />
                <div className="error-button center_text mt--60">
                    <h4>Bummer...No such event was found after so much searching!</h4>
                    <div className="options-btns-div ">
                        <LoadErrorBanner message="This event could not be found or loaded." onRetry={() => window.location.reload()} />
                        <button
                            onClick={() => navigate(-1)}
                            className="rn-button-style--2 rn-btn-reverse"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NoEventFound
