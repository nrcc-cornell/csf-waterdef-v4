import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more'
import Exporting from 'highcharts/modules/exporting'
import ExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment';
import CircularProgress from '@material-ui/core//CircularProgress';
import Backdrop from '@material-ui/core//Backdrop';

HighchartsMore(Highcharts)
Exporting(Highcharts)
ExportData(Highcharts)
window.Highcharts = Highcharts;

const DisplayCharts = (props) => {
    const currentYear = moment().format('YYYY')

    const genChartConfig = (data) => {

        let sat = props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].saturation
        let fc = props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].fieldcapacity
        let stress = props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].stressthreshold
        let prewp = props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].prewiltingpoint
        let wp = props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].wiltingpoint

        //let idxFirstFcst = data.length
        let idxFirstFcst
        if (props.chartWeatherData['dates'] && props.chartWeatherData['dates'].includes(props.chartWeatherData['firstFcstDate'])) {
            idxFirstFcst = props.chartWeatherData['dates'].indexOf(props.chartWeatherData['firstFcstDate'])
        } else {
            idxFirstFcst = data.length
        }
        let plantingYear = props.locInfo.planting_date.slice(6)
        //let firstFcstDate = moment.utc(plantingYear+'-03-01', 'YYYY-MM-DD').add(idxFirstFcst,'days')

        let getDeficitColor = function (d) {
            // return color to use for deficit table value
            var col = null;
            if (d>fc-fc && d<=sat-fc) {
                // Green
                col = "rgba(0,128,0,0.5)";
            } else if (d>stress-fc && d<=fc-fc) {
                // Yellow
                col = "rgba(255,255,0,0.5)";
            } else if (d>prewp-fc && d<=stress-fc) {
                // Orange
                col = "rgba(255,128,0,0.5)";
            } else if (d<=prewp-fc) {
                // Red
                col = "rgba(255,0,0,0.5)";
            } else {
                // No color
                col = null;
            }
            return col;
        }

        let preprocessMarkerColors = function (data,startDate) {
            //console.log(data);
            let nData = [];
            let colorUse = null;
            for (var i = 0; i < data.length; i++) {
                if ((data[i] <= sat-fc) && (data[i] > fc-fc)) {
                    colorUse = 'rgba(0,128,0,0.8)'
                } else if ((data[i] <= fc-fc) && (data[i] > stress-fc)) {
                    colorUse = 'rgba(255,255,0,0.8)'
                } else if ((data[i] <= stress-fc) && (data[i] > prewp-fc)) {
                    colorUse = 'rgba(255,128,0,0.8)'
                } else if ((data[i] <= prewp-fc) && (data[i] > 0.0-fc)) {
                    colorUse = 'rgba(255,0,0,0.8)'
                } else {
                    colorUse = null
                }
                nData.push({
                    x: moment.utc(startDate, 'YYYY-MM-DD').add(i,'days').valueOf(),
                    y: data[i],
                    fillColor: colorUse,
                    color: colorUse
                })
            }
            return nData;
        }

        return {
            plotOptions: {
                line: {
                    animation: false
                },
                series: {
                  states: {
                    inactive: {
                      opacity: 1
                    },
                    hover: {
                      enabled: false
                    }
                  },
                }
            },
            chart: {
                spacingBottom: 10,
                spacingTop: 10,
                spacingLeft: 10,
                spacingRight: 10,
                //height: 460,
                //width: 724,
                backgroundColor: null,
                zoomType: 'x',
                resetZoomButton: {
                    theme: {
                        fill: 'white',
                        stroke: '#006600',
                        'stroke-width': 2,
                        style: { color: '#006600' },
                        r: 10,
                        states: {
                            hover: {
                                fill: '#006600',
                                stroke: '#4ca20b',
                                style: {
                                    color: '#ffffff',
                                }
                            }
                        }
                    }
                },
                events: {
                    load: function(){
                        //show tooltip on today's value
                        let seriesLen = this.series[0].points.length
                        let p = this.series[0].points[seriesLen-1];
                        this.tooltip.refresh(p);
                    }
                }
            },
            title: {
                text: 'Water deficit for '+plantingYear,
                margin: 5,
                //x: 10
            },
            subtitle: {
                text: '@ '+props.locInfo['address'],
            },
            exporting: {
              menuItemDefinitions: {
                // Custom definition
                downloadCSV: {
                  text: 'Download as CSV table'
                },
                downloadXLS: {
                  text: 'Download as XLS table'
                }
              },
              buttons: {
                contextButton: {
                  menuItems: [
                    "printChart",
                    "separator",
                    "downloadPNG",
                    "downloadJPEG",
                    "downloadPDF",
                    "downloadSVG",
                    "separator",
                    "downloadCSV",
                    "downloadXLS",
          //              "viewData",
                    "openInCloud"
                  ]
                }
              }
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { millisecond: '%H:%M:%S.%L', second: '%H:%M:%S', minute: '%H:%M', hour: '%H:%M', day: '%d %b', week: '%d %b', month: '%b<br/>%Y', year: '%Y' },
                min: Date.UTC(parseInt(plantingYear,10),2,1),
                max: (currentYear===plantingYear) ? null : Date.UTC(parseInt(plantingYear,10),9,31),
                labels: {
                  rotation: 0,
                  style: {
                      color: '#000000',
                  }
                },
                plotLines: [{
                    color: 'rgba(0,0,0,0.3)',
                    width: 2,
                    dashStyle: 'dash',
                    value: props.locInfo['planting_date'] ? moment.utc(props.locInfo['planting_date'],'MM/DD/YYYY') : null,
                    // value: (props.locInfo.croptype!=='grass' && props.locInfo['planting_date']) ? moment.utc(props.locInfo['planting_date'],'MM/DD/YYYY') : null,
                    label: {
                        text: 'Planting',
                        rotation: 90,
                        y: 10,
                    },
                    zIndex: 5,
                },{
                    color: 'rgba(0,0,255,0.5)',
                    width: 2,
                    dashStyle: 'dash',
                    value: (props.irrigationIsEnabled && props.locInfo['irrigation_date']) ? moment.utc(props.locInfo['irrigation_date'],'MM/DD/YYYY') : null, 
                    label: {
                        text: 'Irrigation',
                        rotation: 90,
                        y: 10,
                    },
                    zIndex: 5,
                }],
            },
            yAxis: {
                min: props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].wiltingpoint - props.modeldata.soildata.soilmoistureoptions[props.locInfo.soilcapacity].fieldcapacity- 0.3,
                max: Math.max(0.3, Math.max.apply(null, data)),
                gridLineWidth: 0,
                tickLength: 8,
                tickWidth: 1,
                tickPosition: 'outside',
                tickInterval: 0.5,
                lineWidth: 1,
                labels: {
                    format: '{value:.1f}',
                    style: {
                        color: '#000000',
                    }
                },
                title: {
                    text: 'Water Deficit (in/ft soil)',
                    style: {
                        color: '#000000',
                    }
                },
                plotBands: [{
                    color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] > fc-fc)) ? 'rgba(0,128,0,0.5)': 'transparent',
                    from: 0.0,
                    to: sat-fc,
                    label: {
                        text: 'No deficit for plant',
                        style: {
                            fontSize: '1.2em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] > stress-fc)) ? 'rgba(255,255,0,0.5)': 'transparent',
                    from: stress-fc,
                    to: fc-fc,
                    label: {
                        text: 'Deficit, no plant stress',
                        style: {
                            fontSize: '1.2em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] > prewp-fc)) ? 'rgba(255,128,0,0.5)': 'transparent',
                    from: prewp-fc,
                    to: stress-fc,
                    label: {
                        text: 'Deficit, plant stress likely',
                        style: {
                            fontSize: '1.2em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] > wp-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    from: wp-fc,
                    to: prewp-fc,
                    label: {
                        text: 'Deficit, severe plant stress',
                        style: {
                            fontSize: '1.2em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                },{
                    color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] > 0.0-fc)) ? 'rgba(255,0,0,0.5)': 'transparent',
                    from: 0.0-fc,
                    to: wp-fc,
                    label: {
                        text: '',
                        style: {
                            fontSize: '1.2em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] >= 0.0-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= wp-fc) && (data[idxFirstFcst-1] >= 0.0-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'left',
                        verticalAlign: 'middle',
                        x: 10,
                        y: 5
                    },
                }],
                plotLines: [{
                    value: sat-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Saturation',
                        style: {
                            fontSize: '0.8em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= sat-fc) && (data[idxFirstFcst-1] >= fc-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: 0.0,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Field Capacity',
                        style: {
                            fontSize: '0.8em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= fc-fc) && (data[idxFirstFcst-1] >= stress-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: stress-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Plant Stress Begins',
                        style: {
                            fontSize: '0.8em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= stress-fc) && (data[idxFirstFcst-1] >= prewp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                },{
                    value: prewp-fc,
                    width: 1.0,
                    color: '#808080',
                    label: {
                        text: 'Wilting Danger Exists',
                        style: {
                            fontSize: '0.8em',
                            color: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'black' : 'gray',
                            fontWeight: ((currentYear===plantingYear) && (data[idxFirstFcst-1] <= prewp-fc) && (data[idxFirstFcst-1] >= wp-fc)) ? 'bold' : 'lighter',
                        },
                        align: 'right',
                        x: -4,
                        y: 12
                    },
                    zIndex: 6,
                }],
            },
            tooltip: {
                backgroundColor: 'transparent',
                borderColor: 'black',
                borderRadius: 1,
                borderWidth: 0,
                shadow: false,
                style: {
                    padding: 0,
                    fontSize: '12px',
                },

                crosshairs: [{
                    width: 1,
                    color: 'gray',
                    dashStyle: 'solid'
                },{
                    width: 1,
                    color: 'transparent',
                    dashStyle: 'solid'
                }],
                useHTML: true,
                formatter: function() {
                    var selected_bg_color = null
                    var date_label = null
                    var label_color = null
                    selected_bg_color = getDeficitColor(this.point.y)
                    date_label = (this.series.name === 'Deficit') ? 'Observed on' : 'Forecasted for'
                    label_color = (this.series.name === 'Deficit') ? 'rgba(0,0,255,1.0)' : 'rgba(255,0,0,1.0)'
                    var deficit_value = null
                    deficit_value = (this.point.y < 0.00) ? this.point.y.toFixed(2)+'"' : 'NONE ('+this.point.y.toFixed(2)+'" surplus)'
                    var s = [];
                    s.push('<div>')
                    s.push('<table>')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="font-weight:bold; color:'+label_color+';">'+date_label+': </span>')
                    s.push('</td>')
                    s.push('<td>')
                    s.push('<b>'+moment.utc(this.x).format("MM/DD/YYYY")+' @ 8AM</b>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('<tr>')
                    s.push('<td>')
                    s.push('<span style="font-weight:bold; color:'+label_color+';">Water Deficit: </span>')
                    s.push('</td>')
                    s.push('<td>')
                    s.push('<span style="background-color:'+selected_bg_color+'">'+deficit_value+'</span>')
                    s.push('</td>')
                    s.push('</tr>')
                    s.push('</table')
                    s.push('</div>')
                    return s.join('');
                },
                positioner: function (labelWidth, labelHeight, point) {
                    var tooltipX, tooltipY;
                    var yaxis_min;
                    yaxis_min = this.chart.yAxis[0].toPixels(this.chart.yAxis[0].min)
                    tooltipX = this.chart.plotLeft
                    tooltipY = yaxis_min - 60;
                    return {
                        x: tooltipX,
                        y: tooltipY
                    };
                }
            },
            series: [{
                type: 'line',
                name: 'Deficit',
                color: 'rgba(0,0,0,0.8)',
                marker: {
                  enabled: true,
                  symbol: 'circle',
                  lineWidth: 1,
                  lineColor: 'rgba(0,0,0,0.8)',
                  radius: 4
                },
                lineWidth: 2,
                data: preprocessMarkerColors(data.slice(0,idxFirstFcst),props.chartWeatherData['dates'][0]),
            },{
                type: 'line',
                name: 'Deficit Fcst',
                color: 'rgba(0,0,0,0.8)',
                marker: {
                  enabled: true,
                  symbol: 'circle',
                  lineWidth: 1,
                  lineColor: 'rgba(0,0,0,0.8)',
                  radius: 4
                },
                lineWidth: 2,
                dashStyle: 'dot',
                step: false,
                data: preprocessMarkerColors(data.slice(idxFirstFcst),props.chartWeatherData['dates'][idxFirstFcst]),
            }],

              }
        }

    return(

      <>
        <HighchartsReact
          containerProps={{ style: { height: "100%" } }}
          highcharts={Highcharts}
          options={genChartConfig(props.chartWeatherData['deficitDaily'])}
          //callback={afterRender}
        />

        {props.dataIsLoading &&
          <Backdrop
            style={{zIndex:1000}}
            invisible={true}
            //open={!props.values}
            open={props.dataIsLoading}
          >
            <CircularProgress size={200} color="primary"/>
          </Backdrop>
        }
      </>

    );


}

DisplayCharts.propTypes = {
  modeldata: PropTypes.object.isRequired,
  locInfo: PropTypes.object.isRequired,
  irrigationIsEnabled: PropTypes.bool.isRequired,
  chartWeatherData: PropTypes.object.isRequired,
  dataIsLoading: PropTypes.bool.isRequired,
};

export default DisplayCharts;
