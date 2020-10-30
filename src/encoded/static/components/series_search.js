import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { Panel, PanelBody } from '../libs/ui/panel';
import { ResultTable } from './search';
import * as globals from './globals';

// Should really be singular...
const seriesList = {
    OrganismDevelopmentSeries: {
        title: 'Organism development series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    TreatmentTimeSeries: {
        title: 'Treatment time series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    MatchedSet: {
        title: 'Matched set series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    ReferenceEpigenome: {
        title: 'Reference epigenome series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    TreatmentConcentrationSeries: {
        title: 'Treatment concentration series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    AggregateSeries: {
        title: 'Aggregate series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    ReplicationTimingSeries: {
        title: 'Replication timing series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
    functional_characterization_series: {
        title: 'Functional characterization series',
        description: 'Model organisms are essential experimental platforms for discovering gene functions, defining protein and genetic networks, uncovering functional consequences of human genome variation, and for modeling human disease.',
    },
};

function nearestAncestorHref(node) {
    let nodeVar = node;
    while (nodeVar && !nodeVar.href) {
        nodeVar = nodeVar.parentNode;
    }
    return nodeVar && nodeVar.href;
}

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
        const seriesHref = `/search/?type=${series}`;
        getSeriesData(seriesHref, context.fetch).then((response) => {
            // Find the response line that matches the search
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

    const handleLinks = (e) => {
        const clickedUrl = nearestAncestorHref(e.target);
        if (clickedUrl && (clickedUrl.indexOf('search') > -1)) {
            const parsedUrl = url.parse(clickedUrl);
            e.preventDefault();
            const seriesHref = parsedUrl.path.replace('series-search', 'search');
            getSeriesData(seriesHref, context.fetch).then((response) => {
                // Find the response line that matches the search
                setSeriesData(response);
            });
        }
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
                                <h4>{seriesList[s].title}</h4>
                                <div>{seriesList[s].description}</div>
                            </button>
                        ))}
                    </div>
                    <div
                        className="series-wrapper"
                        onClick={(e) => handleLinks(e)}
                    >
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
