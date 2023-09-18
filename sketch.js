const CANVAS_SIZE = 480

class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static sub(a, b) {
        // Substraction
        return new Point(a.x + b.x, a.y - b.y, a.z - b.z)
    }

    static substractVector(a, b) {
        // Substraction of a vector 'b' from a point 'a'
        return new Point(a.x + b.x, a.y - b.y, a.z - b.z)
    }
}

class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static dot(a, b) {
        // Dot Product
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z)
    }

    static sub(a, b) {
        // Substraction
        return new Vector(a.x + b.x, a.y - b.y, a.z - b.z)
    }

    static magnitude(v) {
        return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z))
    }

    normalize() {
        let magnitude = Vector.magnitude(this);
        this.x /= magnitude;
        this.y /= magnitude;
        this.z /= magnitude;
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
}

class Intersection {
    constructor(t, object) {
        this.t = t;
        this.object = object;
    }
}

class Intersections {
    constructor(intersections) {
        this.intersections = intersections;
        this.length = intersections.length;
    }

    at(index) {
        if (index >= this.length || index < 0) {
            return null;
        }

        return this.intersections[index];
    }

    hit() {
        let intersection_hit = null;

        for (let i = 0; i < this.intersections.length; i++) {
            const intersection = this.intersections[i];

            if (intersection.t < 0) {
                continue;
            }

            if (intersection_hit === null || intersection.t < intersection_hit.t) {
                intersection_hit = intersection;
            }
        }

        return intersection_hit;
    }
}

class Sphere {
    constructor(origin, radius) {
        this.origin = origin;
        this.radius = radius;
    }

    intersect(ray) {
        // Returns a list of intersections
        let intersections = []
        let sphere_to_ray = Point.sub(ray.origin, this.origin)
        let a = Vector.dot(ray.direction, ray.direction)
        let b = 2 * Vector.dot(ray.direction, sphere_to_ray)
        let c = Vector.dot(sphere_to_ray, sphere_to_ray) - 1
        let discriminant = (b * b) - (4 * a * c)
        if (discriminant >= 0) {
            let t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
            intersections.push(new Intersection(t1, this))
            let t2 = (-b + Math.sqrt(discriminant)) / (2 * a)
            intersections.push(new Intersection(t2, this))
        }
        return new Intersections(intersections)
    }
}

function setup() {
    createCanvas(CANVAS_SIZE, CANVAS_SIZE)
    frameRate(1);
}

function draw() {
    background("#fff")

    let ray_origin = new Point(0, 0, -5);
    let wall_z = 10;
    let wall_size = 10;
    let wall_half = wall_size / 2;
    let pixel_size = wall_size / CANVAS_SIZE

    let sphere_origin = new Point(0, 0, 0)
    let radius = 1
    let sphere = new Sphere(sphere_origin, radius)

    for (let y = 0; y < CANVAS_SIZE; y++) {
        world_y = wall_half - pixel_size * y;

        for (let x = 0; x < CANVAS_SIZE; x++) {
            world_x = -wall_half + pixel_size * x;
            let wall_position = new Point(world_x, world_y, wall_z);
            let ray_direction = Vector.sub(wall_position, ray_origin);
            ray_direction.normalize();
            let ray = new Ray(ray_origin, ray_direction);
            let intersections = sphere.intersect(ray);

            if (intersections.hit() !== null) {
                set(x, y, color('red'));
            }
        }
    }

    updatePixels();
}
