import { AnchorProvider, Program } from "@project-serum/anchor";

import "./DaoDashboard.css";

type DaoDashboardType = {
    payload: Record<string, any>;
    program: Program;
    provider: AnchorProvider;
};

function DaoDashboard({ payload, program, provider }: DaoDashboardType) {
    return (
        <div className="daodash__container">
            <div className="daodash__daoname">{payload.name}</div>
            <div className="daodash__whitelist_project">
                <div className="dd_wl_text">
                    Check if projects have applied for whitelist
                </div>
                <button className="dd_wl_button">Whitelist Page</button>
            </div>
            <div className="daodash__metricscont">
                <div className="daometrics__top">
                    <div className="daodash__projectwlcont">
                        <div className="dd_metricsleft_no">
                            {payload.whitelistedProjects.toNumber()}
                        </div>
                        <div className="dd_metrics_text">
                            Projects Whitelisted
                        </div>
                    </div>
                    <div className="daodash__avjobscont">
                        <div className="dd_metricsright_no">
                            {payload.availableJobs.toNumber()}
                        </div>
                        <div className="dd_metrics_text">Jobs Available</div>
                    </div>
                </div>
                <div className="daometrics__bottom">
                    <div className="daodash__avbtycont">
                        <div className="dd_metricsleft_no">
                            {payload.availableBounties.toNumber()}
                        </div>
                        <div className="dd_metrics_text">
                            Bounties Available
                        </div>
                    </div>
                    <div className="daodash__cpbtycont">
                        <div className="dd_metricsright_no">
                            {payload.completedBounties.toNumber()}
                        </div>
                        <div className="dd_metrics_text">
                            Bounties Completed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DaoDashboard;
