module Main exposing (main)

import Browser
import Html exposing (..)


initialModel : Model
initialModel =
    0


type alias Model =
    Int


update : msg -> Model -> ( Model, Cmd msg )
update msg model =
    ( model, Cmd.none )


view : Model -> Html msg
view model =
    div []
        [ text "Elm sends his regards from the view function"
        , input [] []
        , div [] [ text "dddddddd" ]
        ]


main : Program () Int msg
main =
    Browser.element
        { init = \_ -> ( initialModel, Cmd.none )
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
