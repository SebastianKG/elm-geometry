import Html exposing (Html)
import OpenSolid.Interval as Interval exposing (Interval(Interval))
import OpenSolid.Vector2d as Vector2d exposing (Vector2d(Vector2d))
import OpenSolid.Point2d as Point2d exposing (Point2d(Point2d))
import OpenSolid.Direction2d as Direction2d exposing (Direction2d)
import OpenSolid.LineSegment2d as LineSegment2d exposing (LineSegment2d(LineSegment2d))
import OpenSolid.Transformation2d as Transformation2d exposing (Transformation2d)

line: String -> a -> Html
line label value =
    Html.div [] [Html.text (label ++ ": " ++ (toString value))]

main =
    let
        intervalWidth = Interval.width (Interval 2 3)
        vectorLength = Vector2d.length (Vector2d 1 1)
        pointDifference = Point2d.difference (Point2d 1 2) Point2d.origin
        rotation = Transformation2d.rotation Point2d.origin (degrees 45)
        lineSegment = LineSegment2d (Point2d 1 0) (Point2d 2 0)
        transformedSegment = LineSegment2d.transform rotation lineSegment
    in
        Html.div []
            [ line "Interval width" intervalWidth
            , line "Vector length" vectorLength
            , line "Point difference" pointDifference
            , line "Transformed line segment" transformedSegment
            ]
