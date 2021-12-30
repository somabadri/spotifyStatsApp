import './App.css';
import 'bulma/css/bulma.min.css';
import spotifyLogo from './icons/Spotify_Icon_RGB_Green.png';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_ACCOUNT_SID;
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize"
const REDIRECT_URL_AFTER_LOGIN = "http://localhost:3000/"
const SCOPES = ["user-top-read", "user-read-currently-playing", "user-read-playback-state"];
const SPACE_DELIMETER = "%20";
const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMETER);

function App() {
    const [artistData, setArtistData] = useState("");
    const [trackData, setTrackData] = useState("");

    const handleLogin = () => {
        window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;
    };

    const handleLogOut = () => {
        localStorage.setItem('jwt_token', "");
        window.location = "/";
    };

    const getAuthToken = (hash) => {
        const stringAfterHashtag = hash.substring(1);
        const paramsUrl = stringAfterHashtag.split("&");
        const paramSplitUp = paramsUrl.reduce((accum, currentValue) => {
            const [key, value] = currentValue.split("=");
            accum[key] = value;
            return accum;
        }, {});
        return paramSplitUp;
    }

    const getTopArtist = () => {
        if (localStorage.jwt_token !== "") {
            axios.get("https://api.spotify.com/v1/me/top/artists?offset=0&limit=10", {
                headers: {
                    Authorization: "Bearer " + localStorage.jwt_token,
                },
            }).then(artistResponse => {
                // console.log(artistResponse);
                setArtistData(artistResponse);
            }).catch((error) => {
                console.log(error);
            })
        }
    };

    const getTopTracks = () => {
        if (localStorage.jwt_token !== "") {
            axios.get("https://api.spotify.com/v1/me/top/tracks?offset=0&limit=10", {
                headers: {
                    Authorization: "Bearer " + localStorage.jwt_token,
                },
            }).then(trackResponse => {
                // console.log(trackResponse);
                setTrackData(trackResponse);
            }).catch((error) => {
                console.log(error);
            })
        }
    };

    useEffect(() => {
        if (window.location.hash) {
            const { access_token } = getAuthToken(window.location.hash);
            localStorage.setItem('jwt_token', access_token);
            window.location = "/";
        }

    }, []);

    function TopArtists(props) {
        if (props !== "") {
            const artists = props.data.items;
            return (
                <div>
                    {artists.map((artist) => (
                        <div key={artist.id} className='artistImages'>
                            <div>
                                <img className='albumImage' alt="artist cover" src={artist.images[2].url} />
                            </div>
                            {artist.name}
                        </div>
                    ))}
                </div>
            )
        }
    }

    function TopTracks(props) {
        if (props !== "") {
            const tracks = props.data.items;
            return (<div>
                {tracks.map((track) => (<div key={track.id} className='artistImages'>
                    <div> <img className='albumImage' alt="album cover" src={track.album.images[2].url} /></div>
                    {track.name}</div>))}
            </div>)
        }
    }

    function LoginButton(props) {
        if (props === "") {
            return (<button onClick={handleLogin} className="button">
                <span className="icon">
                    <img alt="" src={spotifyLogo} />
                </span>
                <span className='buttonText'>Login</span>
            </button>)
        }
        else {
            return (<button onClick={handleLogOut} className="button">
                <span className="icon">
                    <img alt="" src={spotifyLogo} />
                </span>
                <span className='buttonText'>Log Out</span>
            </button>)
        }
    }

    return (
        <div className="App" >
            <div className="topButtons">
                {LoginButton(localStorage.jwt_token)}
                <button onClick={getTopArtist} className="button">
                    <span>Get Artist</span>
                </button>
                <button onClick={getTopTracks} className="button">
                    <span>Get Tracks</span>
                </button>
            </div>
            <div className='lists'>
                <div>
                    <div className='is-size-3'>Your Top Artists</div>
                    {TopArtists(artistData)}
                </div>
                <div>
                    <div className='is-size-3'>Your Top Tracks</div>
                    {TopTracks(trackData)}
                </div>
            </div>

        </div>
    );

}

export default App;