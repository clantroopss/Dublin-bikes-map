import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import { fetchData } from '../Services/BikeService'
import { searchBike } from '../Services/BikeService'
import {fetchPredictions} from '../Services/PredictionService';
import { GoogleApiWrapper } from 'google-maps-react'
import MapRendering from './MapRendering'
import MapForm from './MapForm'

class MapContainer extends Component {

    constructor() {
  	super();
    
    this.state = { overallData: {}};
    this.onRouteChanged = this.onRouteChanged.bind(this);
  }
  
componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    console.log("ROUTE CHANGED");
    fetchData().then((json) => {
        window.store = {stations: json, busData: undefined, luasData: undefined}
        this.setState({overallData: window.store})
    });
  }

  componentDidMount = () => {
    fetchData().then((json) => {
        window.store = {stations: json, busData: undefined, luasData: undefined}
        this.setState({overallData: window.store})
    });
  }
  componentWillReceiveProps(nextProps){
     //call your api and update state with new props
  }
  onFilter = (event) => {
    window.searchresult = searchBike(event);
    fetchData()
      .then((json) => {
        var selectedbikeobject =[];
            if(window.searchresult.selectedstation && window.searchresult.selectedstation.length){
                
                window.searchresult.selectedstation.forEach(function(item){
                  json.filter(function( obj ) {
                                          if(obj.number === item){
                                              selectedbikeobject.push(obj)
                                              return true;
                                          }
                                          return false;
                  });
                });
            } else {
                selectedbikeobject = json.filter(function( obj ) {
                                      return obj.number === window.searchresult.selectedstation;
                                    });
            }
            window.searchbike = {stations: selectedbikeobject, busData: window.searchresult.businfo, luasData: window.searchresult.luasinfo, bike: window.searchresult.bike, bus: window.searchresult.bus,luas: window.searchresult.luas}
            if(window.predictionAll) {
                var prefetchedpred = fetchPredictions(window.searchresult.selectedstation);
                window.searchbike.stations.filter(function (array) {
                            return prefetchedpred.some(function (filter) {
                                if(array.number === filter.number){
                                    array.prediction = filter.score;
                                }
                                return array.number === filter.number;
                            });
                        }); 
                this.setState({overallData: window.searchbike})
            } else {
                fetchPredictions(window.searchresult.selectedstation).then((json) => {
                    if (json){
                        window.searchbike.stations.filter(function (array) {
                            return json.some(function (filter) {
                                if(array.number === filter.number){
                                    array.prediction = filter.score;
                                }
                                return array.number === filter.number;
                            });
                        }); 
                    }
                    this.setState({overallData: window.searchbike})
                });
            }
            
             
            
            //this.setState({overallData: window.searchbike})
        /*fetchPredictions(stationNumber).then((json) => {
            var pred = undefined;
            if (json && json[0]){
              pred = json[0]  
            }
            
            this.setState({predicted: json})
        });*/
        
      })
  }
 
  render() {
    return (
        <div className="MapContainer">
        <div className="wrapper">
          <MapForm onFilter={this.onFilter}  overallData ={this.state.overallData} parentMethod = {this.onRouteChanged}/>
          <Route path="/" render={(props) => <MapRendering google={this.props.google} stations={this.state.overallData} {...props}/>}/>
        </div>
        <br/>
        </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyChZPizXo_3sk70Cm4yveOd0YfQtuxc7As',
  libraries: ['visualization']
})(MapContainer)

