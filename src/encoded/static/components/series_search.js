import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Panel, PanelBody } from '../libs/ui/panel';
import { ResultTable } from './search';
import * as globals from './globals';

// Should really be singular...
const types = {
    matched_set: { title: 'Matched set series' },
    aggregate_series: { title: 'Aggregate series' },
    functional_characterization_series: { title: 'Functional characterization series' },
    single_cell_rna_series: { title: 'Single cell RNA series' },
    organism_development_series: { title: 'Organism development series' },
    reference_epigenome: { title: 'Reference epigenome series' },
    replication_timing_series: { title: 'Replication timing series' },
    treatment_concentration_series: { title: 'Treatment concentration series' },
    treatment_time_series: { title: 'Treatment time series' },
    gene_silencing_series: { title: 'Gene silencing series' },
};

const seriesList = {
    OrganismDevelopmentSeries: 'Organism development series',
    TreatmentTimeSeries: 'Treatment time series',
    MatchedSet: 'Matched set series',
    ReferenceEpigenome: 'Reference epigenome series',
    TreatmentConcentrationSeries: 'Treatment concentration series',
    AggregateSeries: 'Aggregate series',
    ReplicationTimingSeries: 'Replication timing series',
};

// Fetch gene coordinate file
function getSeriesData(seriesLink, fetch) {
    return fetch(seriesLink, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('not ok');
    }).catch((e) => {
        console.log('OBJECT LOAD ERROR: %s', e);
    });
}

const SeriesSearch = (props, context) => {
    const [selectedSeries, setSeries] = React.useState('OrganismDevelopmentSeries');
    const [seriesData, setSeriesData] = React.useState(null);
    const searchBase = url.parse(context.location_href).search || '';
    // const facetdisplay = context.facets && context.facets.some(facet => facet.total > 0);

    const handleClick = React.useCallback((series) => {
        const seriesHref = `/search/?type=${series}&limit=all`;
        getSeriesData(seriesHref, context.fetch).then((response) => {
        //     // Find the response line that matches the search
            setSeries(series);
            setSeriesData(response);
        });
    }, [context.fetch]);

    const currentRegion = (assembly, region) => {
        if (assembly && region) {
            this.lastRegion = {
                assembly,
                region,
            };
        }
        return SeriesSearch.lastRegion;
    };

    // Check to see if device is mobile (small width with touch screen)
    React.useEffect(() => {
        handleClick(selectedSeries);
    }, [handleClick, selectedSeries]);

    return (
        <div className="layout">
            <div className="layout__block layout__block--100">
                <div className="ricktextblock block" data-pos="0,0,0">
                    <center>
                        <h1>{props.context.title}</h1>
                    </center>
                    <div className="series-container">
                        {Object.keys(seriesList).map(s => (
                            <button
                                key={s}
                                className={`series-button${selectedSeries === s ? ' selected' : ''}`}
                                onClick={() => handleClick(s)}
                            >
                                {seriesList[s]}
                            </button>
                        ))}
                    </div>
                    <Panel>
                        <PanelBody>
                            {seriesData ?
                                <ResultTable context={seriesData} searchBase={searchBase} onChange={context.navigate} currentRegion={currentRegion} />
                            : null}
                        </PanelBody>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

// <ResultTable {...props} searchBase={searchBase} onChange={context.navigate} currentRegion={null} />

SeriesSearch.propTypes = {
    context: PropTypes.object.isRequired,
};

SeriesSearch.contextTypes = {
    location_href: PropTypes.string,
    navigate: PropTypes.func,
    fetch: PropTypes.func,
};

globals.contentViews.register(SeriesSearch, 'SeriesSearch');
