module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Http
import Url exposing (Url)


type alias Model =
    { navKey : Nav.Key, earl : Url, text : Maybe String }


type Msg
    = Noop
    | GotText (Result Http.Error String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )

        GotText result ->
            case result of
                Ok str ->
                    ( { model | text = Just str }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Hwet Stack Example"
    , body =
        [ div []
            [ h1 [] [ text "Hapi-Webpack-Elm-TypeScript Example" ]
            , p [] [ text "Example app, we'll put something here later." ]
            , pre [] [ code [] [ text <| Url.toString model.earl ] ]
            , case model.text of
                Just str ->
                    p [] [ text str ]

                Nothing ->
                    -- p [] [ text "Didn't get any text" ]
                    text ""
            ]
        ]
    }


init : flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    ( { navKey = key
      , earl = url
      , text = Nothing
      }
    , Http.get
        { url = "/text"
        , expect = Http.expectString GotText
        }
    )


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
