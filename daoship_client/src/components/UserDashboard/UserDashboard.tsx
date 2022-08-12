import { AnchorProvider, Program } from "@project-serum/anchor";
import "./UserDashboard.css";

type UserDashboardType = {
    payload: Record<string, any>;
    program: Program;
    provider: AnchorProvider;
};

function UserDashboard({ payload, program, provider }: UserDashboardType) {
    return (
        <div className="devdash__container">
            <div className="devdash__top">
                <div className="devdash__topleft">
                    <div className="devdash__name">{payload.displayName}</div>
                    <div className="devdash__bio">{payload.bio}</div>
                </div>
                <div className="devdash__reputation">
                    Reputation:{" "}
                    <span className="devrep">
                        {payload.reputation.toNumber()}
                    </span>
                </div>
            </div>
            <div className="devmetrics__cont">
                <div className="devmetrics__row">
                    <div className="ud_cmptby">
                        <div className="ud_metricsleft_no">
                            {payload.completedBounties.toNumber()}
                        </div>
                        <div className="ud_metrics_text">
                            Completed Bounties
                        </div>
                    </div>
                    <div className="ud_jobsappld">
                        <div className="ud_metricsright_no">
                            {payload.jobsApplied.toNumber()}
                        </div>
                        <div className="ud_metrics_text">Job Applications</div>
                    </div>
                </div>
            </div>
            <div className="dev__buttons">
                <button className="devdb_button">Go To Bounty Dashboard</button>
                <button className="devdb_button">Go To Job Dashboard</button>
            </div>
        </div>
    );
}

export default UserDashboard;
