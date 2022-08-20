module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (class, href)
import Http
import Json.Decode as D
import Json.Decode.Pipeline as DP
import Url exposing (Url)
import Url.Parser as Parser exposing ((</>), Parser, oneOf, s, string)


type alias Dog =
    { id : Int
    , name : String
    , age : Int
    , breed : String
    }


dog : D.Decoder Dog
dog =
    D.succeed Dog
        |> DP.required "id" D.int
        |> DP.required "name" D.string
        |> DP.required "age" D.int
        |> DP.required "breed" D.string


fetchDogs : Cmd Msg
fetchDogs =
    Http.get
        { url = "/dogs"
        , expect = Http.expectJson GotDogs (D.list dog)
        }


type Route
    = Home
    | Buttholes
    | NotHome


parser : Parser (Route -> a) a
parser =
    Parser.oneOf
        [ Parser.map Home Parser.top
        , Parser.map Buttholes (Parser.s "holes")
        ]


fromUrl : Url -> Maybe Route
fromUrl url =
    { url | path = Maybe.withDefault "" url.fragment, fragment = Nothing }
        |> Parser.parse parser


type alias Model =
    { key : Nav.Key
    , earl : Url
    , text : Maybe String
    , dogs : List Dog
    , route : Maybe Route
    }


type Msg
    = Noop
    | GotText (Result Http.Error String)
    | GotDogs (Result Http.Error (List Dog))
    | ClickedLink Browser.UrlRequest


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

        GotDogs dogs ->
            case dogs of
                Ok newDogs ->
                    ( { model | dogs = newDogs }, Cmd.none )

                Err _ ->
                    ( model, Cmd.none )

        ClickedLink request ->
            case request of
                Browser.Internal url ->
                    ( { model | route = fromUrl url }, Nav.pushUrl model.key (Url.toString url) )

                Browser.External _ ->
                    ( model, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Hwet Stack Example"
    , body =
        [ header []
            [ h1 [] [ text "Hapi-Webpack-Elm-TypeScript Example" ]
            , a [ href "/" ] [ text "Butts" ]
            , a [ href "/holes" ] [ text "Holes" ]
            ]
        , div []
            [ p [] [ text "Example app, we'll put something here later." ]
            , pre [] [ code [] [ text <| Url.toString model.earl ] ]
            , case model.text of
                Just str ->
                    p [] [ text str ]

                Nothing ->
                    text ""
            ]
        ]
    }


init : flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url key =
    ( { key = key
      , earl = url
      , text = Nothing
      , dogs = []
      , route = Nothing
      }
    , fetchDogs
    )


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , onUrlRequest = ClickedLink
        , onUrlChange = \_ -> Noop
        }
