import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DoubleSide } from "three";
import { Physics, useBox } from "@react-three/cannon";
import arrowUp from "./assets/arrow-up.png";
import arrowDown from "./assets/arrow-down.png";

const acidos = [
  {
    label: "HCI",
    value: 1.6 * Math.pow(10, 1),
    isAcid: true,
  },
  {
    label: "HNO3",
    value: 2.2 * Math.pow(10, 1),
    isAcid: true,
  },
  {
    label: "HNO2",
    value: 7.1 * Math.pow(10, -4),
    isAcid: true,
  },
  {
    label: "CH3COOH",
    value: 1.8 * Math.pow(10, -5),
    isAcid: true,
  },
];
const bases = [
  {
    label: "NaOH",
    value: 0.63,
    isAcid: false,
  },
  {
    label: "KOH",
    value: 0.63,
    isAcid: false,
  },
  {
    label: "NH3",
    value: 1.8 * Math.pow(10, -5),
    isAcid: false,
  },
  {
    label: "CH3NH2",
    value: 3.7 * Math.pow(10, -4),
    isAcid: false,
  },
];
const cons = [
  {
    label: "1 M",
    value: 1,
  },
  {
    label: "0.5 M",
    value: 0.5,
  },
  {
    label: "0.1 M",
    value: 0.1,
  },
  {
    label: "0.05 M",
    value: 0.05,
  },
  {
    label: "0.01 M",
    value: 0.01,
  },
  {
    label: "0.005 M",
    value: 0.005,
  },
  {
    label: "0.001 M",
    value: 0.001,
  },
  {
    label: "0.0005 M",
    value: 0.0005,
  },
];

const circle = {
  borderRadius: "50%",
  width: 20,
  height: 20,
  marginRight: 10,
  borderWidth: 2,
  borderColor: "black",
  borderStyle: "solid",
};

const panelAcidos = {
  paddingLeft: 10,
  backgroundColor: "#0D9BF0",
  height: 210,
  width: 210,
  position: "absolute",
  zIndex: 1,
  top: 5,
  left: 5,
};

const panelBases = {
  paddingLeft: 10,
  backgroundColor: "#0D9BF0",
  height: 210,
  width: 210,
  position: "absolute",
  top: 265,
  zIndex: 1,
  left: 5,
};

const panelConcentracion = {
  paddingLeft: 10,
  backgroundColor: "#0D9BF0",
  height: 360,
  width: 200,
  position: "absolute",
  right: 5,
  top: 5,
  zIndex: 1,
};

const arrowsContainer = {
  position: "absolute",
  zIndex: 1,
  right: 300,
  top: 5,
};

const arrowUpwards = {
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  height: 100,
  width: 100,
};

const arrowDownwards = {
  backgroundColor: "#FFFFFF",
  borderRadius: 15,
  height: 100,
  width: 100,
  marginLeft: 10,
};

const itemRow = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  height: 35,
};

const mainContainer = { height: "100%" };

function Lights() {
  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight intensity={0.4} position={[-3, 3, 3]} />
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeBufferGeometry attach="geometry" args={[10, 10]} />
      <meshPhysicalMaterial
        attach="material"
        color="#F0770D"
        side={DoubleSide}
      />
    </mesh>
  );
}

function Cylinder() {
  return (
    <mesh>
      <cylinderBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhysicalMaterial
        attach="material"
        color="#A6B0C1"
        opacity={0.7}
        transparent={true}
      />
    </mesh>
  );
}

function Liquid() {
  return (
    <mesh>
      <cylinderBufferGeometry attach="geometry" args={[0.8, 0.8, 0.6]} />
      <meshPhysicalMaterial
        attach="material"
        color="#215FD6"
        opacity={0.8}
        transparent={true}
      />
    </mesh>
  );
}

const Box = forwardRef((props, ref) => {
  const [boxRef, api] = useBox(() => ({ position: [0, 1, 0] }));

  useImperativeHandle(ref, () => ({
    measure() {
      api.position.set(0, 0, 0);
    },
    reset() {
      api.position.set(0, 1, 0);
    },
  }));

  return (
    <mesh ref={boxRef}>
      <mesh position={[0, 2, 0]}>
        <boxBufferGeometry attach="geometry" args={[0.5, 0.5, 0.5]} />
        <meshPhysicalMaterial attach="material" color="#042054" opacity={1} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderBufferGeometry attach="geometry" args={[0.1, 0.1, 2]} />
        <meshPhysicalMaterial attach="material" color="#6E7071" opacity={1} />
      </mesh>
    </mesh>
  );
});

function App() {
  const [solucion, setSolucion] = useState({
    label: "",
    value: 0,
  });
  const [concentracion, setConcentracion] = useState({
    label: "",
    value: 0,
  });
  const [ph, setPh] = useState(null);

  const boxRef = useRef();

  const measure = () => {
    if (concentracion.label !== "" && solucion.label !== "") {
      boxRef.current.measure();
      calculatePH();
    }else{
      window.alert('Debe seleccionar una solución y concentración para calcular el ph');
    }
  };

  const reset = () => {
    boxRef.current.reset();
    setSolucion({ label: "", value: 0 });
    setConcentracion({
      label: "",
      value: 0,
    });
    setPh(null);
  };

  // x2 + kx - c.k
  // a = 1, k = b, c.k = c
  const calculatePH = () => {
    const rootPart = Math.sqrt(
      solucion.value * solucion.value +
        4 * (concentracion.value * solucion.value)
    );
    const denom = 2;

    const firstRoot = (-solucion.value + rootPart) / denom;
    const secondRoot = (-solucion.value - rootPart) / denom;

    const roots = [firstRoot, secondRoot];

    const validValue = roots.filter((value) => value > 0)[0];

    if (solucion.isAcid) {
      setPh(-Math.log10(validValue));
    } else {
      console.log(14 + Math.log10(validValue))

      setPh(14 + Math.log10(validValue));
    }
  };

  return (
    <div style={mainContainer}>
      <div style={panelAcidos}>
        <h3>Ácidos</h3>
        {acidos.map((item) => {
          return (
            <div style={{...itemRow, pointerEvents: ph ? 'none' : 'auto'}} onClick={() => setSolucion(item)}>
              <div
                style={{
                  ...circle,
                  backgroundColor:
                    solucion.label === item.label ? "#297373" : "#0D9BF0",
                }}
              />
              <h4>{item.label}</h4>
            </div>
          );
        })}
      </div>
      <div style={panelBases}>
        <h3>Bases</h3>
        {bases.map((item) => {
          return (
            <div style={{...itemRow, pointerEvents: ph ? 'none' : 'auto'}} onClick={() => setSolucion(item)}>
              <div
                style={{
                  ...circle,
                  backgroundColor:
                    solucion.label === item.label ? "#297373" : "#0D9BF0",
                }}
              />
              <h4>{item.label}</h4>
            </div>
          );
        })}
      </div>
      <div style={panelConcentracion}>
        <h3>Concentración</h3>
        {cons.map((item) => {
          return (
            <div style={{...itemRow, pointerEvents: ph ? 'none' : 'auto'}} onClick={() => setConcentracion(item)}>
              <div
                style={{
                  ...circle,
                  backgroundColor:
                    concentracion.label === item.label ? "#297373" : "#0D9BF0",
                }}
              />
              <h4>{item.label}</h4>
            </div>
          );
        })}
      </div>
      <div style={arrowsContainer}>
        <img
          src={arrowUp}
          alt="Arrow Up"
          onClick={() => reset()}
          style={arrowUpwards}
        />
        <img
          src={arrowDown}
          alt="Arrow Down"
          onClick={() => measure()}
          style={arrowDownwards}
        />
      </div>
      <div
        style={{
          height: 100,
          width: 210,
          right: 300,
          zIndex: 1,
          top: 120,
          backgroundColor: "yellow",
          position: "absolute",
        }}
      ></div>
      <div
        style={{
          height: 90,
          width: 190,
          right: 310,
          zIndex: 1,
          top: 125,
          backgroundColor: "#0D9BA1",
          position: "absolute",
          paddingTop: 20,
          paddingLeft: 35
        }}
      ><span style={{fontSize: 40, fontWeight: '900'}}>{ph ? ph.toFixed(2) : ''}</span></div>

      <Canvas>
        <Physics>
          <Box ref={boxRef} />
        </Physics>
        <Liquid />
        <Cylinder />
        <Lights />
        <Floor />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
