import { AnchorProvider, Program } from "@project-serum/anchor";

import "./ProjectDashboard.css";

type ProjectDashboardType = {
    payload: Record<string, any>;
    setDisplayType: (displayType: string) => void;
};

function ProjectDashboard({ payload, setDisplayType }: ProjectDashboardType) {
    return (
        <div className="projdash__container">
            <div className="projdash__top">
                <div className="projdash__name">{payload.name}</div>
                <div className="projdash__reputation">
                    Reputation:{" "}
                    <span className="projrep">
                        {payload.reputation.toNumber()}
                    </span>
                </div>
            </div>
            <div className="projdash__metricscont">
                <div className="projmetrics__row">
                    <div className="pd_avbntycont">
                        <div className="pd_metricsleft_no">
                            {payload.availableBounties.toNumber()}
                        </div>
                        <div className="pd_metrics_text">
                            Available Bounties
                        </div>
                    </div>
                    <div className="pd_cmpltbntycont">
                        <div className="pd_metricsright_no">
                            {payload.completedBounties.toNumber()}
                        </div>
                        <div className="pd_metrics_text">
                            Completed Bounties
                        </div>
                    </div>
                </div>
                <div className="projmetrics__row">
                    <div className="pd_avjobscont">
                        <div className="pd_metricsleft_no">
                            {payload.availableJobs.toNumber()}
                        </div>
                        <div className="pd_metrics_text">Available Jobs</div>
                    </div>
                    <div className="pd_cmpltjobscont">
                        <div className="pd_metricsright_no">
                            {payload.completedHirings.toNumber()}
                        </div>
                        <div className="pd_metrics_text">Completed Hirings</div>
                    </div>
                </div>
            </div>
            <div className="projdash__createlisting">
                <button
                    className="projdash__joblisting listing_buttons"
                    onClick={() => {
                        setDisplayType("create_bounty");
                    }}
                >
                    Bounty Listings
                </button>
                <button className="projdash__bountylisting" disabled>
                    Job Listings (Coming Soon)
                </button>
            </div>
            <div className="projdash__applywhitelist">
                <div className="projdash__awtext">
                    Apply to DAOs to Get Whitelisted and Get Access <br />
                    to Solana developers for Jobs and Bounties
                </div>
                <button
                    className="projdash__awbutton"
                    onClick={() => setDisplayType("is_whitelistapply")}
                >
                    Apply!
                </button>
            </div>
        </div>
    );
}

export default ProjectDashboard;
