import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { BrowserSelector } from './objectutils';
import { Panel, PanelBody } from '../libs/bootstrap/panel';
import { FacetList } from './facets';
import { FetchedData, Param } from './fetched';
import * as globals from './globals';
import _ from 'underscore';
import { SortTablePanel, SortTable } from './sorttable';
import { TestViz } from './visualizations';
import { Biodalliance } from './biodalliance';
import { TabPanel, TabPanelPane } from '../libs/bootstrap/panel';


const regionGenomes = [
    { value: 'GRCh37', display: 'hg19' },
    { value: 'GRCh38', display: 'GRCh38' },
    { value: 'GRCm37', display: 'mm9' },
    { value: 'GRCm38', display: 'mm10' },
];
const regulomeGenomes = [
    { value: 'GRCh37', display: 'hg19' },
    { value: 'GRCh38', display: 'GRCh38' },
];

const AutocompleteBox = (props) => {
    const terms = props.auto['@graph']; // List of matching terms from server
    const handleClick = props.handleClick;
    const userTerm = props.userTerm && props.userTerm.toLowerCase(); // Term user entered

    if (!props.hide && userTerm && userTerm.length && terms && terms.length) {
        return (
            <ul className="adv-search-autocomplete">
                {terms.map((term) => {
                    let matchEnd;
                    let preText;
                    let matchText;
                    let postText;

                    // Boldface matching part of term
                    const matchStart = term.text.toLowerCase().indexOf(userTerm);
                    if (matchStart >= 0) {
                        matchEnd = matchStart + userTerm.length;
                        preText = term.text.substring(0, matchStart);
                        matchText = term.text.substring(matchStart, matchEnd);
                        postText = term.text.substring(matchEnd);
                    } else {
                        preText = term.text;
                    }
                    return (
                        <AutocompleteBoxMenu
                            key={term.text}
                            handleClick={handleClick}
                            term={term}
                            name={props.name}
                            preText={preText}
                            matchText={matchText}
                            postText={postText}
                        />
                    );
                }, this)}
            </ul>
        );
    }

    return null;
};

AutocompleteBox.propTypes = {
    auto: PropTypes.object,
    userTerm: PropTypes.string,
    handleClick: PropTypes.func,
    hide: PropTypes.bool,
    name: PropTypes.string,
};

AutocompleteBox.defaultProps = {
    auto: {}, // Looks required, but because it's built from <Param>, it can fail type checks.
    userTerm: '',
    handleClick: null,
    hide: false,
    name: '',
};


// Draw the autocomplete box drop-down menu.
class AutocompleteBoxMenu extends React.Component {
    constructor() {
        super();

        // Bind this to non-React methods.
        this.handleClick = this.handleClick.bind(this);
    }

    // Handle clicks in the drop-down menu. It just calls the parent's handleClick function, giving
    // it the parameters of the clicked item.
    handleClick() {
        const { term, name } = this.props;
        this.props.handleClick(term.text, term._source.payload.id, name);
    }

    render() {
        const { preText, matchText, postText } = this.props;

        /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/click-events-have-key-events */
        return (
            <li tabIndex="0" onClick={this.handleClick}>
                {preText}<b>{matchText}</b>{postText}
            </li>
        );
        /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/click-events-have-key-events */
    }
}

AutocompleteBoxMenu.propTypes = {
    handleClick: PropTypes.func.isRequired, // Parent function to handle a click in a drop-down menu item
    term: PropTypes.object.isRequired, // Object for the term being searched
    name: PropTypes.string,
    preText: PropTypes.string, // Text before the matched term in the entered string
    matchText: PropTypes.string, // Matching text in the entered string
    postText: PropTypes.string, // Text after the matched term in the entered string
};

AutocompleteBoxMenu.defaultProps = {
    name: '',
    preText: '',
    matchText: '',
    postText: '',
};

class DataTypes extends React.Component {

    constructor() {
        super();

        // Bind this to non-React methods.
        this.handleInfo = this.handleInfo.bind(this);
    }

    handleInfo(e) {
        let infoId = e.target.id.split("data-type-")[1];
        if (infoId){
            let infoElement = document.getElementById("data-explanation-"+infoId);
            infoElement.classList.toggle("show");
            let iconElement = e.target.getElementsByTagName("i")[0];
            if (e.target.getElementsByTagName("i")[0].className.indexOf("icon-caret-right") > -1){
                iconElement.classList.add("icon-caret-down");
                iconElement.classList.remove("icon-caret-right");
            } else {
                iconElement.classList.remove("icon-caret-down");
                iconElement.classList.add("icon-caret-right");
            }
        }
    }

    render () {
        return(
            <div className="data-types">
                <div className="data-types-instructions"><h4>Use RegulomeDB to identify DNA features and regulatory elements in non-coding regions of the human genome by entering ...</h4></div>
                <div className="data-types-block" onClick={this.handleInfo}>
                    <h4 id="data-type-0" className="data-type"><i className="icon icon-caret-right" /> dbSNP IDs</h4>
                    <p className="data-type-explanation" id="data-explanation-0">Enter dbSNP ID(s) (example) or upload a list of dbSNP IDs to identify DNA features and regulatory elements that contain the coordinate of the SNP(s).</p>
                    <h4 id="data-type-1" className="data-type"><i className="icon icon-caret-right" /> Single nucleotides</h4>
                    <p className="data-type-explanation" id="data-explanation-1">Enter hg19 coordinates for a single nucleotide as 0-based (example) coordinates or in a BED file (example), VCF file (example), or GFF3 file (example). These coordinates will be mapped to a dbSNP IDs (if available) in addition to identifying DNA features and regulatory elements that contain the input coordinate(s).</p>
                    <h4 id="data-type-2" className="data-type"><i className="icon icon-caret-right" /> A chromosomal region</h4>
                    <p className="data-type-explanation" id="data-explanation-2">Enter hg19 chromosomal regions, such as a promoter region upstream of a gene, as 0-based (example) coordinates or in a BED file (example) or GFF3 file (example). All dbSNP IDs with an allele frequency >1% that are found in this region will be used to identify DNA features and regulatory elements that contain the coordinate of the SNP(s).</p>
                </div>
            </div>
        )
    }
}

DataTypes.propTypes = {
    handleInfo: PropTypes.func,
};


class AdvSearch extends React.Component {
    constructor() {
        super();

        // Set intial React state.
        /* eslint-disable react/no-unused-state */
        // Need to disable this rule because of a bug in eslint-plugin-react.
        // https://github.com/yannickcr/eslint-plugin-react/issues/1484#issuecomment-366590614
        this.state = {
            disclosed: false,
            showAutoSuggest: false,
            searchTerm: '',
            coordinates: '',
            genome: 'GRCh37',
            terms: {},
        };
        /* eslint-enable react/no-unused-state */

        // Bind this to non-React methods.
        this.handleDiscloseClick = this.handleDiscloseClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAutocompleteClick = this.handleAutocompleteClick.bind(this);
        this.handleAssemblySelect = this.handleAssemblySelect.bind(this);
        this.handleOnFocus = this.handleOnFocus.bind(this);
        this.handleExamples = this.handleExamples.bind(this);
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        // Use timer to limit to one request per second
        this.timer = setInterval(this.tick, 1000);

        // const sequenceData = ['AGATCGACCCT',
        //     'GGAACGACGCT',
        //     'GGATCGACCCT',
        //     'CGATAGACGCT',
        //     'CGATAGACGCT',
        //     'GGATCGACCCT'];
        //
        // const seqLenBounds = [5, 25];
        // const seqNumBounds = [1, 10];
        // const seqSelector = '#sequence-logo';
        //
        // entryPoint(sequenceData, seqLenBounds, seqNumBounds, seqSelector);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    handleDiscloseClick() {
        this.setState(prevState => ({
            disclosed: !prevState.disclosed,
        }));
    }

    handleChange(e) {
        this.setState({ showAutoSuggest: true, terms: {} });
        this.newSearchTerm = e.target.value;
    }

    handleAutocompleteClick(term, id, name) {
        const newTerms = {};
        const inputNode = this.annotation;
        inputNode.value = term;
        newTerms[name] = id;
        this.setState({ terms: newTerms, showAutoSuggest: false });
        inputNode.focus();
        // Now let the timer update the terms state when it gets around to it.
    }

    handleAssemblySelect(event) {
        // Handle click in assembly-selection <select>
        this.setState({ genome: event.target.value });
    }

    handleOnFocus() {
        this.setState({ showAutoSuggest: false });
        this.context.navigate(this.context.location_href);
    }

    handleExamples(e){

        let replaceNewline = (input) => {

            let replaceAll = (str, find, replace) => {
                return str.replace(new RegExp(find, 'g'), replace);
            }

            var newline = String.fromCharCode(13, 10);
            return replaceAll(input, "\\n", newline);
        }

        let exampleString = "";
        if (e.target.id === "example-snps") {
            exampleString = "rs3768324\nrs75982468\nrs10905307\nrs10823321\nrs7745856";
        } else if (e.target.id === "example-coordinates") {
            exampleString = "chr11:62607065-62607067\nchr10:5894500-5894501\nchr10:11741181-11741181\nchr1:39492463-39492463\nchr6:10695158-10695160";
        } else if (e.target.id === "example-nucleotide"){
            exampleString = "ENSG00000102974";
        } else {
            exampleString = "rs3768324\nrs75982468\nrs10905307\nrs10823321\nrs7745856";
        }
        document.getElementById("multiple-entry-input").value = replaceNewline(exampleString);
    }

    tick() {
        if (this.newSearchTerm !== this.state.searchTerm) {
            this.setState({ searchTerm: this.newSearchTerm });
        }
    }

    render() {
        const context = this.props.context;
        const id = url.parse(this.context.location_href, true);
        const region = id.query.region || '';
        const searchBase = url.parse(this.context.location_href).search || '';

        if (this.state.genome === '') {
            this.setState({ genome: context.assembly || regionGenomes[0].value });
        }

        return (
            <Panel>
                <PanelBody>
                    <form id="panel1" className="adv-search-form" autoComplete="off" aria-labelledby="tab1" onSubmit={this.handleOnFocus} >
                        <div className="form-group">
                            <label htmlFor="annotation"><i className="icon icon-search"></i>Search by dbSNP ID, coordinate range, or single nucleotide coordinate (hg19)</label>
                            <div className="input-group input-group-region-input">
                                <textarea className="multiple-entry-input" id="multiple-entry-input" placeholder="Enter search parameters here." onChange={this.handleChange} name="region">
                                </textarea>

                                <p className="example-inputs" onClick={this.handleExamples}>Click for example entry: <span className="example-input" id="example-snps">multiple dbSNPs</span>, <span className="example-input" id="example-coordinates">0-based coordinates</span>, or <span className="example-input" id="example-nucleotide">single nucleotide coordinate</span></p>

                                <input type="submit" value="Search" className="btn btn-sm btn-info" />
                                <input type="hidden" name="genome" value={this.state.genome} />
                            </div>
                        </div>

                    </form>

                </PanelBody>
            </Panel>
        );
    }
}

AdvSearch.propTypes = {
    context: PropTypes.object.isRequired,
};

AdvSearch.contextTypes = {
    autocompleteTermChosen: PropTypes.bool,
    autocompleteHidden: PropTypes.bool,
    onAutocompleteHiddenChange: PropTypes.func,
    location_href: PropTypes.string,
    navigate: PropTypes.func,
};

const PeakDetails = (props) => {

    const context = props.context;
    const peaks = context.peak_details;

    const peaksTableColumns = {
        method: {
            title: 'Method',
        },

        chrom: {
            title: 'Chromosome location',
            getValue: item => item.chrom+":"+item.start+".."+item.end,
        },

        biosample_term_name: {
            title: 'Biosample term name',
        },

        targets: {
            title: 'Targets',
            getValue: item => item.targets.join(', '),
        },
    };

    return (
        <div>
            <SortTablePanel title="Peak details">
                <SortTable list={peaks} columns={peaksTableColumns} />
            </SortTablePanel>
        </div>
    );

}

const ResultsTable = (props) => {

    const context = props.context;
    const data = context["@graph"];

    const dataColumns = {

        assay_title: {
            title: 'Method',
            getValue: item => item.assay_title ? item.assay_title : item.annotation_type,
        },

        biosample_term_name: {
            title: 'Biosample term name',
        },

        organ_slims: {
            title: 'Organ',
            getValue: (item) => item.organ_slims ? item.organ_slims.join(', ') : "",
        },

        assay_slims: {
            title: 'Assay',
        },

        accession: {
            title: "Link",
            display: (item) => {
                return <a href={item['@id']}>{item.accession}</a>;
            }
        },

        description: {
            title: 'Description',
        },
    };

    return (
        <div>
            <SortTablePanel>
                <SortTable list={data} columns={dataColumns} />
            </SortTablePanel>
        </div>
    );

}

// class SequenceLogo extends React.Component {
//     render (){
//         return (
//             <div className="sequence-logo-container">
//                 <div id="sequence-logo" className="sequence-logo"></div>
//             </div>
//         );
//     }
// }

class RegulomeSearch extends React.Component {
    constructor() {
        super();

        let assemblies = 'hg19';
        this.assembly == 'hg19';

        this.state = {
            tableBatch: 0,
            biodallianceBatch: 0,
        }

        // Bind this to non-React methods.
        this.onFilter = this.onFilter.bind(this);
        this.currentRegion = this.currentRegion.bind(this);
        this.incrementBiodalliance = this.incrementBiodalliance.bind(this);
    }

    onFilter(e) {
        if (this.props.onChange) {
            const search = e.currentTarget.getAttribute('href');
            this.props.onChange(search);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    incrementBiodalliance(e) {
        this.state.biodallianceBatch += 1;
    }

    currentRegion(assembly, region) {
        if (assembly && region) {
            this.lastRegion = {
                assembly,
                region,
            };
        }
        return Search.lastRegion;
    }

    render() {
        const context = this.props.context;
        const results = context['@graph'];
        // const columns = context.columns;
        const notification = context.notification;
        const searchBase = url.parse(this.context.location_href).search || '';
        // const trimmedSearchBase = searchBase.replace(/[?|&]limit=all/, '');
        const filters = context.filters;
        const facets = context.facets;
        const total = context.total;

        console.log(filters);

        const tableLimit = 100;
        console.log(this);
        console.log(this.props);

        // let browseAllFiles = true; // True to pass all files to browser
        // let browserAssembly = ''; // Assembly to pass to ResultsBrowser component
        let browserDatasets = []; // Datasets will be used to get vis_json blobs
        let browserFiles = []; // Files to pass to ResultsBrowser component
        // let assemblyChooser;

        let visualizeCfg = context.visualize_batch;
        console.log(visualizeCfg);

        // Get a sorted list of batch hubs keys with case-insensitive sort
        let visualizeKeys = [];
        if (context.visualize_batch && Object.keys(context.visualize_batch).length) {
            visualizeKeys = Object.keys(context.visualize_batch).sort((a, b) => {
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();
                return (aLower > bLower) ? 1 : ((aLower < bLower) ? -1 : 0);
            });
        }
        console.log(visualizeKeys);

        // Probably not worth a define in globals.js for visualizable types and statuses.
        browserFiles = results.filter(file => ['bigBed', 'bigWig'].indexOf(file.file_format) > -1);
        if (browserFiles.length > 0) {
            browserFiles = browserFiles.filter(file =>
                ['released', 'in progress', 'archived'].indexOf(file.status) > -1
            );
        }

        // Distill down to a list of datasets so they can be passed to genome_browser code.
        browserDatasets = browserFiles.reduce((datasets, file) => (
            (!file.dataset || datasets.indexOf(file.dataset) > -1) ? datasets : datasets.concat(file.dataset)
        ), []);

        console.log("browser datasets");
        console.log(browserDatasets);

        console.log("browser files");
        console.log(browserFiles);

        const title = "Results details";

        let Facets = facets.filter(f => f.field === "organ_slims" || f.field === "target.label" || f.field === "assay_term_name" || f.field === "biosample_term_name");

        return (
            <div>
                <div className="lead-logo"><img src="/static/img/RegulomeLogoFinal.gif"></img></div>

                {notification.startsWith('Success') ?
                    <div>
                        <div>
                            <div className="panel">
                                <div>
                                    <div className="result-summary">
                                        {(context.notification) ?
                                            <p>{context.notification}</p>
                                        : null}
                                        {(context.coordinates) ?
                                            <p>Searched coordinates: {context.coordinates}</p>
                                        : null}
                                        {(context.regulome_score) ?
                                            <p className="regulomescore">RegulomeDB score: {context.regulome_score}</p>
                                        : null}
                                    </div>
                                    {(context.regulome_score  && !context.peak_details) ?
                                        <a
                                            rel="nofollow"
                                            className="btn btn-info btn-sm btn-left centered-btn"
                                            href={searchBase ? `${searchBase}&peak_metadata` : '?peak_metadata'}
                                        >
                                            See peaks
                                        </a>
                                    : null}
                                    {(context.peak_details !== undefined && context.peak_details !== null) ?
                                        <div className="btn-container">
                                            <a className="btn btn-info btn-sm" href={context.download_elements[0]} data-bypass>Download peak details (TSV)</a>
                                            <a className="btn btn-info btn-sm" href={context.download_elements[1]} data-bypass>Download peak details (JSON)</a>
                                        </div>
                                    : null}

                                    <FacetList
                                        facets={Facets}
                                        filters={context.filters}
                                        orientation="horizontal"
                                        searchBase={searchBase}
                                        onFilter={this.onFilter}
                                    />

                                    <TestViz {...this.props}/>

                                    {visualizeKeys && context.visualize_batch ?
                                        <div className="visualize-block">
                                            { total > this.props.visualizeLimit ?
                                                <h4>Genome browser <span className="results-count">({Math.min(tableLimit,total)} of {total})</span><span className="click-for-more-results" onClick={this.incrementBiodalliance}>See next {Math.min(this.props.visualizeLimit,total-this.props.visualizeLimit*(this.state.biodallianceBatch+1))} result(s)<i className="icon icon-long-arrow-right" /></span></h4>
                                            :
                                                <h4>Genome browser <span className="results-count">({Math.min(this.props.visualizeLimit,total)} of {total})</span></h4>
                                            }
                                            {visualizeCfg['hg19']['UCSC'] ?
                                                <div>
                                                    <Biodalliance {...this.props} browserFiles={browserDatasets} biodallianceBatch={this.state.biodallianceBatch} />
                                                    <div className="visualize-element"><a href={visualizeCfg['hg19']['UCSC']} rel="noopener noreferrer" target="_blank">UCSC</a></div>
                                                </div>
                                            :
                                                <div className="visualize-element visualize-error">Choose other datasets. These cannot be visualized.</div>
                                            }
                                        </div>
                                    : null }

                                </div>

                                { total > this.props.visualizeLimit ?
                                    <h4>Results table <span className="results-count">({Math.min(tableLimit,total)} of {total})</span><span className="click-for-more-results" onClick={this.incrementTable}>See next {Math.min(this.props.tableLimit,total-this.props.tableLimit*(this.state.tableBatch+1))} result(s)<i className="icon icon-long-arrow-right" /></span></h4>
                                :
                                    <h4>Results table <span className="results-count">({Math.min(this.props.tableLimit,total)} of {total})</span></h4>
                                }

                                <ResultsTable {...this.props}/>

                            </div>
                        </div>
                    </div>
                : null }

                {(context.peak_details) ?
                    <div>
                        <div className="panel">
                            <div className="result-summary">
                                {(context.notification) ?
                                    <p>{context.notification}</p>
                                : null}
                                {(context.coordinates) ?
                                    <p>Searched coordinates: {context.coordinates}</p>
                                : null}
                                {(context.regulome_score) ?
                                    <p className="regulomescore">RegulomeDB score: {context.regulome_score}</p>
                                : null}
                                {(context.regulome_score  && !context.peak_details) ?
                                    <a
                                        rel="nofollow"
                                        className="btn btn-info btn-sm btn-left"
                                        href={searchBase ? `${searchBase}&peak_metadata` : '?peak_metadata'}
                                    >
                                        See peaks
                                    </a>
                                : null}
                            </div>
                            {(context.peak_details !== undefined && context.peak_details !== null) ?
                                <div>
                                    <div className="btn-container">
                                        <a className="btn btn-info btn-sm" href={context.download_elements[0]} data-bypass>Download peak details (TSV)</a>
                                        <a className="btn btn-info btn-sm" href={context.download_elements[1]} data-bypass>Download peak details (JSON)</a>
                                    </div>
                                    <PeakDetails {...this.props} />
                                </div>

                            : null}
                        </div>
                    </div>
                : null}

                {(context.peak_details === undefined && !notification.startsWith('Success')) ?
                    <div>
                        <AdvSearch {...this.props} />
                        <DataTypes />
                    </div>
                :  null}

            </div>
        );
    }
}

RegulomeSearch.propTypes = {
    context: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    incrementBiodalliance: PropTypes.func,
    visualizeLimit: PropTypes.number,
};

RegulomeSearch.defaultProps = {
    onChange: null,
    incrementBiodalliance: null,
    visualizeLimit: 100,
};

RegulomeSearch.contextTypes = {
    location_href: PropTypes.string,
    navigate: PropTypes.func,
};

globals.contentViews.register(RegulomeSearch, 'region-search');
