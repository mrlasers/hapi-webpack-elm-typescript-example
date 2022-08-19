module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Url exposing (Url)


type alias Model =
    { navKey : Nav.Key, earl : Url }


type Msg
    = Noop


update : msg -> Model -> ( Model, Cmd msg )
update msg model =
    ( model, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Whatever App"
    , body =
        [ div []
            [ text "Elm sends his regards from the view function"
            , input [] []
            , div [] [ text "dddddddd" ]
            ]
        ]
    }


init : flags -> Url -> Nav.Key -> ( Model, Cmd msg )
init _ url key =
    ( { navKey = key, earl = url }, Cmd.none )


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , onUrlRequest = \_ -> Noop
        , onUrlChange = \_ -> Noop
        }
