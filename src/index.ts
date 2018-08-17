(function() {
  const math = Math;

  interface IPoint3D {
    x: number;
    y: number;
    z: number;
  }

  interface IPoint2D {
    x: number;
    y: number;
  }

  /**
   * 粒子数据
   */
  interface IParticle {
    // 运动轨迹
    path: IPoint3D[];
    // 生存时间
    lifetime: number;
    // 创建时间
    birthday: number;
  }

  /**
   * 贝塞尔曲线
   * @param path 路径
   * @param rate 比率
   */
  function bezier(path: IPoint3D[], rate: number): IPoint3D {
    let first = path[0];
    let second = path[1];
    switch (path.length) {
      case 1:
        return first; // 数组需要克隆，非数组直接返回
      case 2:
        return {
          x: first.x + (second.x - first.x) * rate,
          y: first.y + (second.y - first.y) * rate,
          z: first.z + (second.z - first.z) * rate
        };
      default:
        let temp = [];
        for (let i = 1; i < path.length; i++) {
          temp.push(bezier([path[i - 1], path[i]], rate));
        }
        return bezier(temp, rate);
    }
  }

  /**
   * 计算距离
   * @param a
   * @param b
   */
  function distance(a: IPoint2D, b: IPoint2D): number {
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  /**
   * 获取角度
   * @param origin 原点
   * @param point 参考点
   */
  function toAngle(origin: IPoint2D, point: IPoint2D) {
    return math.atan2(point.y - origin.y, point.x - origin.x);
  }

  /**
   * 将 3D 坐标投影到 2D
   *
   * @param point 原坐标
   * @param zOffset z 轴偏移
   * @param distance 距离
   */
  function projection(point: IPoint3D, zOffset: number, distance: number) {
    return {
      x: (distance * point.x) / (point.z - zOffset),
      y: (distance * point.y) / (point.z - zOffset)
    };
  }

  const canvas = document.querySelector(
    "canvas.snow-globe"
  ) as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  const context = canvas.getContext("2d");

  /** 大球半径 */
  const globeRadius = 150;

  const particles: IParticle[] = [];
  const maxParticles = 7000;

  /**
   * 添加一个粒子
   */
  const appendParticle = (): IParticle => {
    const path: IPoint3D[] = [];
    for (let i = 0; i < 5; i++) {
      path.push({
        x: -globeRadius + math.random() * globeRadius * 2,
        y: -globeRadius + math.random() * globeRadius * 2,
        z: -globeRadius + math.random() * globeRadius * 2
      });
    }
    const result = {
      lifetime: 5000 + math.random() * 15000,
      birthday: Date.now(),
      path: path
    };
    particles.push(result);
    return result;
  };

  /**
   * 移除一个粒子
   * @param particle
   */
  const removeParticle = (particle: IParticle) => {
    const index = particles.indexOf(particle);
    if (index >= 0) {
      particles.splice(index, 1);
    }
  };

  /**
   * 渲染一个粒子
   * @param particle
   */
  const renderParticle = (particle: IParticle) => {
    if (Date.now() - particle.birthday > particle.lifetime) {
      removeParticle(particle);
      return;
    }
    const t = (Date.now() - particle.birthday) / particle.lifetime;
    const point3d = bezier(particle.path, t);
    const point = projection(point3d, 150, globeRadius);
    const d = distance({ x: 0, y: 0 }, point);
    if (d > globeRadius) {
      const a = toAngle({ x: 0, y: 0 }, point);
      point.x = math.cos(a) * globeRadius;
      point.y = math.sin(a) * globeRadius;
    }

    point.x += globeRadius + 10;
    point.y += globeRadius + 10;
    const r = math.min(
      math.max(math.floor(math.abs(point3d.z / globeRadius / 2) * 10), 3),
      10
    );

    context.fillStyle = `rgba(255, 255, 255, ${(1 - (0.5 + t * 0.5)).toFixed(
      2
    )})`;
    context.beginPath();
    context.arc(point.x, point.y, r, 0, 2 * math.PI);
    context.fill();
  };

  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
      renderParticle(particle);
    });
  };

  for (let i = 0; i < 100; i++) {
    appendParticle();
  }

  let tick = Date.now();
  const next = () => {
    if (Date.now() - tick > 50) {
      if (particles.length < maxParticles) {
        for (let i = 0; i < 10; i++) {
          appendParticle();
        }
      }
    }
    render();
    requestAnimationFrame(() => {
      next();
    });
  };
  next();
})();
