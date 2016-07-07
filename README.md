# elm-opensolid-core

OpenSolid consists of a set of Elm libraries for working with geometry. It is
intended to provide a solid foundation for HTML-based applications in areas such
as CAD (computer-aided design), CAM (computer-aided manufacturing), and 2D/3D
visualization.

This library contains the OpenSolid core data types - vectors, directions
(type-safe unit vectors), points, axes, planes and frames (coordinate systems)
in 2D and 3D:

```elm
Vector3d.zero == Vector3d ( 0, 0, 0 )
Direction2d.y == Direction2d ( 0, 1 )
Point2d.origin == Point2d ( 0, 0 )

Axis3d.z ==
    Axis3d { originPoint = Point3d.origin, direction = Direction3d.z }

Frame2d.xy ==
    Frame2d
        { originPoint = Point2d.origin
        , xDirection = Direction2d.x
        , yDirection = Direction2d.y
        }

Plane3d.yz ==
    Plane3d
        { originPoint = Point3d.origin
        , xDirection = Direction3d.y
        , yDirection = Direction3d.z
        , normalDirection = Direction3d.x
        }
```

A large range of geometric operations are supported:

```elm
-- Arithmetic
Vector3d.plus (Vector3d ( 1, 2, 3 )) (Vector3d ( 4, 5, 6 )) == Vector3d ( 5, 7, 9 )
Point3d.vectorFrom (Point3d ( 1, 1, 1 )) (Point3d ( 3, 5, 4 )) == Vector3d ( 2, 4, 3 )
Point2d.distanceFrom Point2d.origin (Point2d ( 1, 1 )) == 1.4142

-- Transformations
Point3d.mirrorAcross Plane3d.xy (Point3d ( 1, 2, 3 )) == Point3d ( 1, 2, -3 )
Vector2d.rotateBy (degrees 45) (Vector2d ( 1, 1 )) == Vector2d ( 0, 1.4142 )
Point2d.rotateAround Point2d.origin (degrees 45) (Point2d ( 1, 0 )) == Point2d ( 0.7071, 0.7071 )
Plane3d.translateIn Direction3d.z 3 Plane3d.xy == Plane3d.offsetBy 3 Plane3d.xy
Point3d.projectOnto Plane3d.xy (Point3d ( 2, 1, 3 )) == Point3d ( 2, 1, 0 )
Vector3d.projectionIn Direction3d.z (Vector3d ( 3, 1, 4 )) == Vector3d ( 0, 0, 4 )

-- Constructors
Point2d.alongAxis Axis2d.x 3 == Point2d ( 3, 0 )
Direction2d.fromAngle (degrees 30) == Direction2d ( 0.866, 0.5 )
Vector2d.inDirection Direction2d.y 2.5 == Vector2d ( 0, 2.5 )
Plane3d.fromPointAndNormal Point3d.origin Direction3d.y == Plane3d.zx
```

## Usage notes

### Importing modules

Most OpenSolid modules are designed to imported as qualified, for example

```elm
import OpenSolid.Core.Point3d as Point3d
```

The main exception is the `Types` module, which only contains type definitions
and is intended to be imported without qualification:

```elm
import OpenSolid.Core.Types exposing (..)
```

The JSON `Encode` and `Decode` modules are also designed to be imported
unqualified, as that seems to be the style established by existing JSON
encode/decode modules.

### Directions

OpenSolid uses the concept of a 'direction' where other libraries typically use
vectors with unit length. Having separate types helps to keep track of whether
a vector has already been normalized -- no more having to guess whether a
function that accepts a vector argument actually needs a unit vector, and if so
whether you're expected to normalize the vector yourself or whether the function
will do that internally.

You can normalize a vector to produce a direction with the `Vector2d.direction`
and `Vector3d.direction` functions, but they actually return `Maybe` values
since the zero vector has no direction:

```elm
Vector2d.direction (Vector2d ( 3, 0 )) == Just (Direction2d ( 1, 0 ))
Vector2d.direction (Vector2d ( -2, 2 )) == Just (Direction2d ( -0.7071, 0.7071 ))
Vector2d.direction (Vector2d ( 0, 0 )) == Nothing
```

This takes advantage of Elm's type system to ensure that all code considers the
degenerate zero-vector case, which is easy to run into when (for example) trying
to compute the normal direction to a degenerate triangle in 3D.

### Transformations

Many of OpenSolid is concerned with different kinds of transformations --
translations, rotations, scalings, mirrors, and projections. Unlike most other
geometric libraries, however, OpenSolid does not use matrices to define
transformations (in fact, matrices are not used anywhere). Instead,
transformations are simply Elm functions. This has many advantages. First, it
means that transformations can be directly used with higher-order functions like
`List.map`:

```elm
pointsOnXAxis =
    [ Point2d ( 1, 0 ), Point2d ( 2, 0 ), Point2d ( 3, 0 ) ]

rotateNinetyDegrees =
    Point2d.rotateAround Point2d.origin (degrees 90)

pointsOnYAxis =
    List.map rotateNinetyDegrees pointsOnXAxis

pointsOnYAxis == [ Point2d ( 0, 1 ), Point2d ( 0, 2 ), Point2d ( 0, 3 ) ]
```

Second, transformations can be composed like any other functions to produce
composite transformations (no more having to remember multiplication order of
matrices!):

```elm
rotateThenScale =
    Point2d.rotateAround Point2d.origin (degrees 90) >> Point2d.scaleAbout Point2d.origin 1.5

rotateThenScale (Point2d ( 1, 0 )) == Point2d ( 0, 1.5 )
rotateThenScale (Point2d ( 0, 2 )) == Point2d ( -3, 0 )
```

(Yes, in this particular case it doesn't actually matter whether you rotate
first and then scale or the other way around, but you get the idea.) You can
even compose transformation functions with other functions (perhaps ones you
define yourself!) to produce composite 'transformations' that would be
impossible to represent with a transformation matrix:

```elm
horizontalDistanceFromOrigin =
    Point3d.projectOnto Plane3d.xy >> Point3d.distanceFrom Point3d.origin

horizontalDistanceFromOrigin (Point3d ( 3, 4, 2 )) == 5
horizontalDistanceFromOrigin (Point3d ( 1, 1, 1 )) == sqrt 2
```
