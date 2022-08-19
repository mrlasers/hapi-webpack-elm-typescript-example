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
    { title = "Hwet Stack Example"
    , body =
        [ div []
            [ h1 [] [ text "Hapi-Webpack-Elm-TypeScript Example" ]
            , p [] [ text "Example app, we'll put something here later." ]
            , pre [] [ code [] [ text <| Url.toString model.earl ] ]
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
