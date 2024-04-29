const CANVAS_SIZE = 480

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static hadamard_product(a, b) {
        // Multiplying colors
        return new Color(a.r * b.r, a.g * b.g, a.b * b.b);
    }

    static mul(v, scalar) {
        return new Color(scalar * v.r, scalar * v.g, scalar * v.b)
    }

    static add(a, b) {
        // Addition
        return new Color(a.r + b.r, a.g + b.g, a.b + b.b)
    }
}

class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static sub(a, b) {
        // Substraction
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z)
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
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z)
    }

    static add(a, b) {
        // Addition
        return new Vector(a.x + b.x, a.y + b.y, a.z + b.z)
    }

    static magnitude(v) {
        return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z))
    }

    static mul(v, scalar) {
        return new Vector(scalar * v.x, scalar * v.y, scalar * v.z)
    }

    static reflect(v, normal) {
        return this.sub(v, Vector.mul(normal, 2 * Vector.dot(v, normal)))
    }

    static negation(v) {
        return Vector.mul(v, -1)
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

    position(t) {
        return Vector.add(this.origin, Vector.mul(this.direction, t));
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

class Material {
    constructor(color, ambient, diffuse, specular, shininess) {
        this.color = color;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }

    static get_default() {
        return new Material(new Color(1, 1, 1), 0.1, 0.9, 0.9, 200.0)
    }
}

class Sphere {
    constructor(origin, radius, material = undefined) {
        this.origin = origin;
        this.radius = radius;
        this.material = material;
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

    normal_at(p) {
        // Calculation without taking in consideration sphere transformations
        let sub = Vector.sub(p, this.origin);
        sub.normalize();
        return sub;
    }
}

class Light {
    constructor(position, intensity) {
        this.position = position;
        this.intensity = intensity;
    }

    static lighting(material, light, point, eyev, normalv) {
        let effective_color = Color.hadamard_product(material.color, light.intensity);
        let lightv = Vector.sub(light.position, point);
        lightv.normalize();
        let ambient = Color.mul(effective_color, material.ambient);

        let diffuse, specular;
        let light_dot_normal = Vector.dot(lightv, normalv);

        if (light_dot_normal < 0) {
            diffuse = new Color(0, 0, 0); // black
            specular = new Color(0, 0, 0); // black
        } else {
            diffuse = Color.mul(effective_color, material.diffuse * light_dot_normal);

            let reflectv = Vector.reflect(Vector.negation(lightv), normalv)
            let reflect_dot_eye = Vector.dot(reflectv, eyev)

            if (reflect_dot_eye <= 0) {
                specular = new Color(0, 0, 0); // black
            } else {
                let factor = Math.pow(reflect_dot_eye, material.shininess)
                specular = Color.mul(light.intensity, material.specular * factor)
            }
        }

        return Color.add(ambient, Color.add(diffuse, specular))
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
    let pixel_size = wall_size / CANVAS_SIZE;

    let sphere_origin = new Point(0, 0, 0);
    let radius = 1;
    let material = Material.get_default();
    material.color = new Color(1, 0.2, 1); //#ff33ff
    let sphere = new Sphere(sphere_origin, radius, material);

    let light_position = new Point(-10, 10, -10);
    let light_color = new Color(1, 1, 1);
    let light = new Light(light_position, light_color);

    for (let y = 0; y < CANVAS_SIZE; y++) {
        world_y = wall_half - pixel_size * y;

        for (let x = 0; x < CANVAS_SIZE; x++) {
            world_x = -wall_half + pixel_size * x;
            let wall_position = new Point(world_x, world_y, wall_z);
            let ray_direction = Vector.sub(wall_position, ray_origin);
            ray_direction.normalize();
            let ray = new Ray(ray_origin, ray_direction);
            let intersections = sphere.intersect(ray);

            let intersection = intersections.hit()
            if (intersection !== null) {
                let intersection_point = ray.position(intersection.t);
                let intersection_normal = intersection.object.normal_at(intersection_point);
                let eye_vector = Vector.negation(ray_direction);
                let computed_color = Light.lighting(intersection.object.material, light, intersection_point, eye_vector, intersection_normal);
                set(x, y, color(computed_color.r * 255, computed_color.g * 255, computed_color.b * 255));
            }
        }
    }

    updatePixels();
}
