import React, { Component } from 'react';
import '../../css/TabAddPublication.css';
import AddPublication from './AddPublication';
import { Pagination } from './Pagination';
import { Filter } from './Filter';
import { YearPicker } from 'react-dropdown-date';
import { Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';

export class TabAddPublication extends Component {

    state = {
        sort: "0",
        pubmedSearch: "",
        search: "",
        page: 1,
        count: 20,
        latestYear: '',
        earliestYear: '',
        largeSearchFlag: false,
        resultMode: ''
    }

    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
        this.handlePaginationUpdate = this.handlePaginationUpdate.bind(this);
        this.filter = this.filter.bind(this);
        this.handleFilterUpdate = this.handleFilterUpdate.bind(this);
        this.acceptPublication = this.acceptPublication.bind(this);
        this.rejectPublication = this.rejectPublication.bind(this);
        this.handleSearchUpdate = this.handleSearchUpdate.bind(this);
    }

    handlePaginationUpdate(event, page) {
        this.setState({
            page: page
        });
        if(event.target.value !== undefined) {
            this.setState({
                count: event.target.value
            });
        }
    }

    handleSearchUpdate(event) {
        this.setState({
            pubmedSearch: event.target.value
        });
    }

    handleFilterUpdate(filterState) {
        this.setState({
            search: filterState.search,
            page: 1
        });
    }

    acceptPublication(id) {

        const pubmedPublications = []
        this.props.pubmedData.forEach(function(publication){
            if(publication.pmid === id) {
                publication.evidence = []
                pubmedPublications.push(publication)
            }
        })
        const request = {
            faculty: this.props.identityData,
            publications: pubmedPublications,
            userAssertion: 'ACCEPTED',
            manuallyAddedFlag: true
        }
        this.props.updatePublication(this.props.identityData.uid, request)
    }

    rejectPublication(id) {
        const pubmedPublications = []
        this.props.pubmedData.forEach(function(publication){
            if(publication.pmid === id) {
                publication.evidence = []
                pubmedPublications.push(publication)
            }
        })

        const request = {
            faculty: this.props.identityData,
            publications: pubmedPublications,
            userAssertion: 'REJECTED',
            manuallyAddedFlag: true
        }
        this.props.updatePublication(this.props.identityData.uid, request)
    }

    filter() {
        const thisObject = this;

        // Get array of PMIDs from pending publications
        const pubmedIds = []
        this.props.reciterData.reciterPending.forEach(function(publication){
            pubmedIds.push(publication.pmid)
        })

        this.props.reciterData.reciter.forEach(function(publication){
            if(publication.userAssertion === 'ACCEPTED' || publication.userAssertion === 'REJECTED')
            pubmedIds.push(publication.pmid)
        })

        // Filter
        var filteredPublications = [];

        thisObject.props.pubmedData.forEach((publication) =>{
            if(!pubmedIds.includes(publication.pmid)) {
                if(thisObject.state.search !== "") {
                    if(/^[0-9 ]*$/.test(thisObject.state.search)) {
                        var pmids = thisObject.state.search.split(" ");
                        if(pmids.some(pmid => Number(pmid) === publication.pmid )){
                            filteredPublications.push(publication);
                        }
                    }else {
                        var addPublication = true;
                        // check filter search
                        if (thisObject.state.search !== "") {
                            addPublication = false;
                            //pmcid
                            if(publication.pmcid !== undefined && publication.pmcid.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //publicationTypeCanonical
                            if(publication.publicationTypeCanonical !== undefined && publication.publicationTypeCanonical.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //scopusDocID
                            if(publication.scopusDocID !== undefined && publication.scopusDocID.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //journalTitleISOabbreviation
                            if(publication.journalTitleISOabbreviation !== undefined && publication.journalTitleISOabbreviation.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //journalTitleVerbose
                            if(publication.journalTitleVerbose !== undefined && publication.journalTitleVerbose.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //publication date display
                            if(publication.displayDate !== undefined && publication.displayDate.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            //doi
                            if(publication.doi !== undefined && publication.doi.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true
                            }
                            // title
                            if (publication.title.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true;
                            }
                            // journal
                            if (publication.journal.toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                addPublication = true;
                            }
                            //issn
                            if(publication.issn !== undefined) {
                                var issnArray = publication.issn.map((issn, issnIndex) => {
                                    return issn.issn
                                })
                                if(issnArray.join().toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                    addPublication = true;
                                }
                            }
                            // authors
                            if (publication.authors !== undefined) {
                                var authorsArray = publication.authors.map(function (author, authorIndex) {
                                    return author.authorName;
                                });
                                if (authorsArray.join().toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                    addPublication = true;
                                }
                            }
                            //evidence
                            if (publication.evidence !== undefined) {
                                var evidenceArticleArray = publication.evidence.map(function (evidence, evidenceIndex) {
                                    return evidence.articleData;
                                });
                                var evidenceInstArray = publication.evidence.map(function (evidence, evidenceIndex) {
                                    return evidence.institutionalData;
                                });
                                if (evidenceInstArray.join().toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                    addPublication = true;
                                }
                                if (evidenceArticleArray.join().toLowerCase().includes(thisObject.state.search.toLowerCase())) {
                                    addPublication = true;
                                }
                            }
                        }
                        if (addPublication) {
                            filteredPublications.push(publication);
                        }
                    }
                }else {
                    filteredPublications.push(publication);
                }
            }
        })

        var from = (parseInt(this.state.page, 10) - 1) * parseInt(this.state.count, 10);
        var to = from + parseInt(this.state.count, 10) - 1;
        var publications = [];
        var i = from;
        for(i; i <= to; i++) {
            if(filteredPublications[i] !== undefined) {
                publications.push(filteredPublications[i]);
            }
        }
        if(publications.length === 0 && this.props.reciterData.pubmedSearchResults !== undefined && this.props.reciterData.pubmedSearchResults.length > 0) {
            publications = this.props.reciterData.pubmedSearchResults;
        }
        return {
            filteredPublications: filteredPublications,
            paginatedPublications: publications
        };
    }

    search() {

        const thisObject = this
        const searchText = this.refs['search-field'].value

        this.setState({
            pubmedSearch: searchText
        }, function(){
            var query = {
                "strategy-query": this.state.pubmedSearch,
            };

            if(this.state.earliestYear !== '' && this.state.latestYear !== '') {
                query = {
                    "strategy-query": this.state.pubmedSearch,
                    "start": this.state.earliestYear + '/01/01',
                    "end": this.state.latestYear + '/12/31'
                }
            }
            if(this.state.earliestYear !== '' && (this.state.latestYear === '' || this.state.latestYear === undefined)) {
                query = {
                    "strategy-query": this.state.pubmedSearch,
                    "start": this.state.earliestYear + '/01/01',
                    "end": '2500/12/31'
                }
            }
            if((this.state.earliestYear === '' || this.state.earliestYear === undefined) && this.state.latestYear !== '') {
                query = {
                    "strategy-query": this.state.pubmedSearch,
                    "start": '1600/01/01',
                    "end": this.state.latestYear + '/12/31'
                }
            }

            this.props.getPubmedPublications(query)
        })

    }

    render() {
        const publications = this.filter();
        const thisObject = this;

        const reciterPublications = []
        this.props.reciterData.reciterPending.forEach(function(publication){
            reciterPublications.push(publication)
        })

        this.props.reciterData.reciter.forEach(function(publication){
            reciterPublications.push(publication)
        })

        var searchAcceptedCount = 0;
        var searchRejectedCount = 0;

        thisObject.props.pubmedData.forEach((searchPub) => {
            if (reciterPublications.some(publication => publication.pmid === searchPub.pmid && publication.userAssertion === "ACCEPTED")) {
                searchAcceptedCount++;
            }
            if (reciterPublications.some(publication => publication.pmid === searchPub.pmid && publication.userAssertion === "REJECTED")) {
                searchRejectedCount++;
            }
        })

        return (
            <div>
                <div className="h6fnhWdeg-add-publication-search-container">
                    <div className="row">
                        <div className="col-md-6">
                            <InputGroup>
                                <FormControl
                                placeholder="Search..."
                                ref="search-field"
                                defaultValue={(this.state.pubmedSearch !== undefined)?this.state.pubmedSearch:''}
                            />
                            <InputGroup.Append>
      <Button className="btn btn-primary"
                                onClick={this.search}>Search</Button>
    </InputGroup.Append></InputGroup>
                        </div>
                        <div className="col-md-2" >
                            <div className="show-rows">
                                <label className="year-label">Earliest</label>
                                <YearPicker
                                    defaultValue={''}
                                    // default is 1900
                                    start={new Date().getFullYear()-20}
                                    // default is false
                                    required={true}
                                    // mandatory
                                    value={(this.state.earliestYear !== undefined)?this.state.earliestYear:(this.state.earliestYear !== undefined)? this.state.earliestYear:''}
                                    // mandatory
                                    onChange={(year) => {
                                        this.setState({ earliestYear: year });
                                    }}
                                    classes={"form-control"}
                                    id={'year'}
                                    name={'year'}
                                    optionClasses={'option classes'}
                                />
                            </div>
                        </div>
                        <div className="col-md-2" >
                            <div className="show-rows">
                                <label className="year-label">Latest</label>
                                <YearPicker
                                    defaultValue={''}
                                    // default is 1900
                                    start={new Date().getFullYear()-20}
                                    // default is false
                                    required={true}
                                    // mandatory
                                    value={(this.state.latestYear !== undefined)?this.state.latestYear:(this.state.latestYear !== undefined)?this.state.latestYear:''}
                                    // mandatory
                                    onChange={(year) => {
                                        this.setState({ latestYear: year });
                                    }}
                                    classes={"form-control"}
                                    id={'year'}
                                    name={'year'}
                                    optionClasses={'option classes'}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            
                        </div>
                    </div>
                </div>

                {
                    (this.props.pubmedFetching) ? <div className="h6fnhWdeg-app-loader"></div> :
                    <div>
                        {(this.props.pubmedData.length > 0) ?
                            <div>
                                <div className="row py-5 mx-0 backgroundColorWhite">
                                    <div className="col-md-4">
                                        <p>Number of results: <strong>{this.props.pubmedData.length}</strong></p>
                                        <p><span>See also: <strong>{searchAcceptedCount}</strong> already accepted, <strong>{searchRejectedCount}</strong> already rejected</span></p>
                                    </div>

                                </div>
                                {
                                    (this.state.largeSearchFlag === true) ? <div><span><strong>Too many results. Please provide additional search parameters</strong></span>
                                        </div> :
                                        <React.Fragment>
                                        <Row className="backgroundColorWhite py-5 mb-1 mx-0">
                                            <Col lg={10}>
                                            <Pagination total={this.props.pubmedData.length} page={this.state.page}
                                                        count={this.state.count}
                                                        onChange={this.handlePaginationUpdate}/>
                                            </Col>
                                            <Col lg={2}>
                                             <Filter onChange={this.handleFilterUpdate} showSort={false}/>
                                            </Col>
                                        </Row>
                                            <Row>
                                            <Col md={12}>
                                            <div>
                                                
                                                    {
                                                        publications.paginatedPublications.map(function (item, index) {
                                                            return <AddPublication item={item} key={index}
                                                                                   onAccept={thisObject.acceptPublication}
                                                                                   onReject={thisObject.rejectPublication}/>;
                                                        })
                                                    }
                                                    
                                            </div>
                                            </Col>
                                            </Row>
                                        </React.Fragment>
                                }

                            </div> : null
                        }
                    </div>
                }


            </div>
        );
    }
}

export default TabAddPublication;