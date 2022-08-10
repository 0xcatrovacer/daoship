import { Program, Provider } from "@project-serum/anchor";
import "./NotRegistered.css";

type NotRegisteredProps = {
    setDisplayType: (displayType: string) => void;
};

function NotRegistered(props: NotRegisteredProps) {
    return (
        <div className="notregistered__container">
            <div className="notregistered__hero">
                <div className="nreg__herotext">Seem's Like You Have</div>
                <div className="nreg__herotext">Not Registered Yet</div>
            </div>
            <div className="notregistered__buttoncont">
                <button
                    className="notregistered__button"
                    onClick={() => props.setDisplayType("onboarding")}
                >
                    Register Now!
                </button>
            </div>
        </div>
    );
}

export default NotRegistered;
