"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface Theatrical3DCurtainProps {
  isOpen: boolean; // true = tirai terbuka, false = tertutup rapat
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
  className?: string;
}

/**
 * Parameter visual & fisika yang paling enak di-tweak sesuai suasana auditorium.
 */
export const CURTAIN_CONFIG = {
  // Palet Beludru (Hex)
  velvetDeepShadow: "#0c0104", // Bayangan terdalam di lekukan lipatan
  velvetBaseColor: "#4a0612", // Warna dasar merah anggur tua (Royal Burgundy)
  velvetMidCrimson: "#7d0b1e", // Warna transisi saat terkena sorot lampu
  velvetSheenColor: "#ff9b85", // Kilau serat beludru pada sudut grazing (rim sheen)
  goldPrimary: "#e6b85c", // Warna emas utama untuk bordir, rumbai, dan tali
  goldHighlight: "#fff1be", // Kilau spekular emas
  goldShadow: "#593b0c", // Bayangan lekukan ornamen emas

  // Pencahayaan Panggung
  spotlightWarmColor: "#ffd699", // Warna lampu sorot atas
  spotlightIntensity: 1.55, // Intensitas sorot panggung utama
  ambientIntensity: 0.42, // Cahaya ambien dasar
  seamGlowIntensity: 1.35, // Cahaya dramatis yang menyembul dari celah tengah saat mulai buka

  // Fisika & Pacing Teatrikal
  pleatCount: 15.0, // Jumlah lipatan utama per panel tirai
  baseFoldDepth: 0.24, // Kedalaman lipatan saat tertutup
  gatheredFoldDepth: 0.58, // Kedalaman tumpukan lipatan saat terkumpul di tepi
  openStiffness: 2.35, // Kekakuan pegas saat membuka (semakin kecil = semakin lambat & megah)
  openDamping: 2.45, // Redaman pegas saat membuka
  closeStiffness: 2.75, // Kekakuan pegas saat menutup
  closeDamping: 2.65, // Redaman pegas saat menutup
  hemInertiaLag: 0.42, // Seberapa berat bagian bawah tirai tertinggal dibanding rel atas
  airBillowStrength: 0.55, // Seberapa kuat kain mengembung ke arah penonton saat bergerak

  // Partikel Debu Panggung
  dustCount: 150, // Jumlah partikel debu halus di berkas cahaya atas
};

interface SpringNode {
  pos: number;
  vel: number;
}

// ============================================================================
// SHADER 1: TIRAI BELUDRU UTAMA (VERTEX + FRAGMENT)
// ============================================================================

const VELVET_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSide;          // -1.0 = Panel Kiri, +1.0 = Panel Kanan
  uniform float uStageWidth;
  uniform float uStageHeight;
  uniform float uTrackOpen;     // 0..1 posisi rel atas
  uniform float uWaistOpen;     // 0..1 posisi ikatan tali emas di pinggang
  uniform float uHemOpen;       // 0..1 posisi pemberat bawah
  uniform float uVelocity;      // Kecepatan sesaat untuk efek hembusan udara (billow)
  uniform float uSettleWave;    // Riak gelombang vertikal saat tirai mengendap
  uniform float uPleatCount;
  uniform float uBaseFoldDepth;
  uniform float uGatheredFoldDepth;
  uniform float uAirBillow;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  varying float vFoldPhase;
  varying float vFoldCrest;
  varying float vCavityAO;
  varying float vGatherFactor;
  varying float vPinchTension;

  // Fungsi pembentuk profil posisi 3D tirai untuk uv.x (0 = tepi luar, 1 = tepi tengah)
  // dan uv.y (0 = ujung bawah lantai, 1 = rel atas)
  vec3 evaluateCurtainSurface(
    vec2 uv,
    out float outFoldPhase,
    out float outCrest,
    out float outCavity,
    out float outGather,
    out float outPinch
  ) {
    float u = uv.x; // 0 di dinding samping, 1 di garis belahan tengah
    float v = uv.y; // 0 di lantai bawah, 1 di gantungan atas

    // Profil bukaan mulus dan anggun di sepanjang tinggi panggung
    // Rel atas (track), tengah (waist), dan bawah (hem) bergerak dengan inersia harmonis
    float verticalOpenProfile = mix(uHemOpen, uTrackOpen, v);
    // Kelenturan organik kain di bagian tengah saat ditarik
    verticalOpenProfile = mix(verticalOpenProfile, uWaistOpen, sin(v * 3.14159265) * 0.3);

    float openAmount = clamp(verticalOpenProfile, 0.0, 1.0);
    outGather = openAmount;

    // Batas luar tirai (terkunci di luar frame panggung)
    float outerEdgeX = 0.54 * uStageWidth;

    // Saat tertutup (open = 0), kedua tirai saling tumpuk rapat di tengah (-0.016)
    // Saat terbuka penuh (open = 1), tirai terkumpul anggun di tepi panggung (0.442 * uStageWidth)
    // menyisakan 88% area tengah panggung bersih total tanpa menghalangi video YouTube
    float closedInnerX = -0.016 * uStageWidth;
    float openInnerTargetX = 0.442 * uStageWidth;

    float innerEdgeX = mix(closedInnerX, openInnerTargetX, openAmount);

    // Saat tirai membuka ke tepi, kain terkumpul padat (accordion pleat bunching)
    float bunchPower = mix(1.0, 0.82, outGather);
    float uShaped = pow(u, bunchPower);

    float baseX = mix(outerEdgeX, innerEdgeX, uShaped);

    // ---- LIPATAN KAIN (MULTI-HARMONIC PLEATS) ----
    float sideSeed = uSide * 0.45;
    float gravitySpread = mix(1.04, 0.96, v);
    float theta = (u * uPleatCount * gravitySpread * 6.2831853) + sideSeed;

    // Gelombang lipatan utama + harmonik ke-2 (lipatan pipa beludru tebal) + mikro-lipatan
    float primaryWave = sin(theta);
    float pipeWave = -0.25 * sin(2.0 * theta + 0.7);
    float microCrease = 0.08 * cos(3.0 * theta - v * 2.5);

    outPinch = 0.0;
    float combinedWave = primaryWave + pipeWave + microCrease;
    outFoldPhase = theta;
    outCrest = clamp(combinedWave * 0.5 + 0.5, 0.0, 1.0);

    // Konservasi kain: saat tirai menyempit ke samping, lipatan Z semakin dalam!
    float foldDepth = mix(uBaseFoldDepth, uGatheredFoldDepth, pow(outGather, 0.85));
    float verticalFoldScale = mix(0.72, 1.12, pow(1.0 - v, 0.65));
    float zPleat = combinedWave * foldDepth * verticalFoldScale;

    // Siluet S-curve pada puncak lipatan
    float xPleatOffset = cos(theta) * foldDepth * 0.22 * (0.4 + 0.6 * outGather);

    // ---- DINAMIKA UDARA & AYUNAN (AIR BILLOW + IDLE SWAY) ----
    float billowMask = sin(u * 3.14159265) * sin(v * 3.14159265);
    float zBillow = -uVelocity * uAirBillow * billowMask * 1.3;

    // Riak vertikal saat mengendap
    float zSettleRipple = sin(v * 12.0 - uTime * 7.5) * uSettleWave * 0.12 * (1.0 - v * 0.6) * u;

    // Ayunan napas halus
    float idleBreath = (
      sin(uTime * 1.15 + u * 2.4 + uSide) * 0.024 +
      cos(uTime * 0.78 - v * 3.1) * 0.015
    ) * (1.0 - v * 0.75);

    // ---- KETINGGIAN Y & HEM TEATER ----
    float topY = 0.525 * uStageHeight;
    float bottomY = -0.515 * uStageHeight;
    float baseY = mix(bottomY, topY, v);

    // Sedikit ayunan dinamis pada ujung lipatan bawah
    float pleatHemDrop = (1.0 - outCrest) * 0.01 * uStageHeight * (1.0 - v);

    float finalX = uSide * (baseX + xPleatOffset);
    float finalY = baseY - pleatHemDrop;
    float finalZ = zPleat + zBillow + zSettleRipple + idleBreath;

    // Ambient occlusion alami di dasar lembah lipatan
    outCavity = clamp(
      (1.0 - outCrest) * mix(0.62, 0.95, outGather),
      0.0,
      1.0
    );

    return vec3(finalX, finalY, finalZ);
  }

  void main() {
    vUv = uv;

    float foldPhase;
    float crest;
    float cavity;
    float gather;
    float pinch;

    vec3 pos = evaluateCurtainSurface(uv, foldPhase, crest, cavity, gather, pinch);

    // Hitung normal, tangent, dan bitangent secara presisi dengan Finite Differences
    float epsU = 0.0025;
    float epsV = 0.0025;
    float dummy1, dummy2, dummy3, dummy4, dummy5;

    vec3 posU = evaluateCurtainSurface(
      vec2(clamp(uv.x + epsU, 0.0, 1.0), uv.y),
      dummy1, dummy2, dummy3, dummy4, dummy5
    );
    vec3 posV = evaluateCurtainSurface(
      vec2(uv.x, clamp(uv.y + epsV, 0.0, 1.0)),
      dummy1, dummy2, dummy3, dummy4, dummy5
    );

    vec3 dU = normalize(posU - pos);
    vec3 dV = normalize(posV - pos);

    // Karena uSide = -1 membalik sumbu X untuk panel kiri, kita kalikan cross product
    // dengan -uSide agar normal selalu menghadap ke arah penonton (+Z)
    vec3 computedNormal = normalize(cross(dU, dV) * (-uSide));
    if (computedNormal.z < 0.0) {
      computedNormal = -computedNormal;
    }

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * computedNormal);
    vTangent = normalize(mat3(modelMatrix) * dU);
    vBitangent = normalize(mat3(modelMatrix) * dV);

    vFoldPhase = foldPhase;
    vFoldCrest = crest;
    vCavityAO = cavity;
    vGatherFactor = gather;
    vPinchTension = pinch;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const VELVET_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSide;
  uniform float uStageWidth;
  uniform float uStageHeight;
  uniform float uWaistOpen;
  uniform vec3 uVelvetShadow;
  uniform vec3 uVelvetBase;
  uniform vec3 uVelvetMid;
  uniform vec3 uVelvetSheen;
  uniform vec3 uGoldPrimary;
  uniform vec3 uGoldHighlight;
  uniform vec3 uGoldShadow;
  uniform vec3 uSpotWarmColor;
  uniform float uSpotIntensity;
  uniform float uAmbientIntensity;
  uniform float uSeamGlowIntensity;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  varying float vFoldPhase;
  varying float vFoldCrest;
  varying float vCavityAO;
  varying float vGatherFactor;
  varying float vPinchTension;

  // Hash & Value Noise 2D cepat untuk tekstur serat beludru mikro
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float fiberNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Charlie / Ashikhmin Velvet Sheen Distribution
  float velvetCharlieSheen(float NdotH, float roughness) {
    float invR = 1.0 / max(roughness, 0.04);
    float cos2h = NdotH * NdotH;
    float sin2h = max(1.0 - cos2h, 0.0078125);
    return (2.0 + invR) * pow(sin2h, invR * 0.5) / 6.2831853;
  }

  void main() {
    // ---- 1. MICRO-WEAVE & FIBER PERTURBATION ----
    // Skala rajutan benang beludru (mengikuti koordinat intrinsik kain vUv)
    vec2 weaveUv = vec2(vUv.x * 420.0, vUv.y * 520.0);
    float warpThread = sin(weaveUv.x * 6.28318);
    float weftThread = cos(weaveUv.y * 6.28318);
    float microPile = fiberNoise(weaveUv * 0.35) * 0.65 + fiberNoise(weaveUv * 1.1) * 0.35;

    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 B = normalize(vBitangent);

    // Perturbasi normal mikro dari serat beludru
    float fiberPerturbX = (microPile - 0.5) * 0.14 + warpThread * 0.03;
    float fiberPerturbY = (weftThread * 0.03);
    N = normalize(N + T * fiberPerturbX + B * fiberPerturbY);

    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotV = clamp(abs(dot(N, V)), 0.001, 1.0);

    // ---- 2. PENCAHAYAAN PANGGUNG TEATRIKAL (3 LAMPU SOROT) ----
    // Lampu Sorot 1 & 2: Sepasang Proscenium Overhead Spotlights yang menyapu lipatan
    // Saat tirai membuka, fokus sorot ikut bergeser ke arah tepi panggung
    float spotFocusX = uSide * mix(0.22, 0.38, vGatherFactor) * uStageWidth;
    vec3 spotPos1 = vec3(spotFocusX, uStageHeight * 0.58, 6.2);
    vec3 spotPos2 = vec3(0.0, uStageHeight * 0.45, 7.8); // Center flood hangat
    vec3 footlightPos = vec3(uSide * 0.18 * uStageWidth, -uStageHeight * 0.58, 4.5);

    vec3 L1 = normalize(spotPos1 - vWorldPos);
    vec3 L2 = normalize(spotPos2 - vWorldPos);
    vec3 L3 = normalize(footlightPos - vWorldPos);

    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);

    // Attenuation kerucut lampu sorot panggung
    float distToSpot1 = length((vWorldPos.xy - vec2(spotFocusX, 0.08 * uStageHeight)) / vec2(uStageWidth * 0.48, uStageHeight * 0.65));
    float spotCone1 = smoothstep(1.35, 0.15, distToSpot1) * uSpotIntensity;

    float distToSpot2 = length(vWorldPos.xy / vec2(uStageWidth * 0.75, uStageHeight * 0.75));
    float spotCone2 = smoothstep(1.25, 0.1, distToSpot2) * (uSpotIntensity * 0.65);

    // Subsurface Wrap Diffuse (khas kain tebal berwarna pekat)
    float wrap = 0.38;
    float diff1 = max(0.0, (dot(N, L1) + wrap) / (1.0 + wrap)) * spotCone1;
    float diff2 = max(0.0, (dot(N, L2) + wrap) / (1.0 + wrap)) * spotCone2;
    float diffFoot = max(0.0, (dot(N, L3) + 0.25) / 1.25) * smoothstep(0.6, 0.0, vUv.y) * 0.45;

    // Self-shadowing di dalam lekukan lipatan (Cavity Occlusion)
    float foldShadow = mix(1.0, 0.12, pow(vCavityAO, 1.35));
    float directLight = (diff1 + diff2 + diffFoot) * mix(0.28, 1.0, foldShadow);

    // ---- 3. CHARLIE VELVET GRAZING SHEEN (KILAU BELUDRU) ----
    // Efek kilau khas beludru saat permukaan kain melengkung menjauhi kamera (grazing angle)
    float grazingFresnel = pow(1.0 - NdotV, 3.1);
    float charlie1 = velvetCharlieSheen( abs(dot(N, H1)), 0.32 ) * spotCone1 * 0.18;
    float charlie2 = velvetCharlieSheen( abs(dot(N, H2)), 0.38 ) * spotCone2 * 0.14;

    // Anisotropic highlight sepanjang punggung lipatan vertikal
    float TdotH = dot(B, H1);
    float anisoPeak = pow(max(0.0, 1.0 - TdotH * TdotH), 14.0) * vFoldCrest * spotCone1 * 0.25;

    // Serat mikro berkilau halus di punggung lipatan
    float fiberSparkle = (0.75 + 0.5 * microPile) * vFoldCrest;
    float totalSheen = (grazingFresnel * 0.72 + charlie1 + charlie2 + anisoPeak) * fiberSparkle * mix(0.2, 1.0, foldShadow);

    // ---- 4. KOMPOSISI WARNA BELUDRU MERAH ANGGUR ----
    vec3 baseVelvet = mix(uVelvetShadow, uVelvetBase, clamp(directLight * 0.85 + uAmbientIntensity * foldShadow, 0.0, 1.0));
    baseVelvet = mix(baseVelvet, uVelvetMid, clamp(directLight * 0.68 * vFoldCrest, 0.0, 1.0));

    // Tambahkan kilau beludru hangat (crimson-peach gold sheen)
    vec3 sheenContribution = mix(uVelvetMid, uVelvetSheen, 0.65) * uSpotWarmColor * totalSheen * 0.85;
    vec3 fabricColor = baseVelvet + sheenContribution;

    // ---- 5. RIM LIGHT & SEAM GLOW DI TEPI TENGAH SAAT MENYIBAK ----
    // Saat tirai baru mulai membuka (0.01 < uWaistOpen < 0.45), cahaya panggung dari belakang
    // menembus tepi belahan tengah tirai (uv.x -> 1.0)
    float seamOpenWindow = smoothstep(0.0, 0.08, uWaistOpen) * (1.0 - smoothstep(0.25, 0.75, uWaistOpen));
    float innerEdgeMask = smoothstep(0.86, 1.0, vUv.x);
    vec3 seamRimLight = uGoldHighlight * uSeamGlowIntensity * innerEdgeMask * seamOpenWindow * (0.6 + 0.4 * grazingFresnel);
    fabricColor += seamRimLight;

    // Rim light halus permanen di tepi dalam lipatan agar terpisah tegas dari video di belakang
    float permanentEdgeRim = smoothstep(0.93, 1.0, vUv.x) * grazingFresnel * 0.45;
    fabricColor += uSpotWarmColor * permanentEdgeRim;

    // ---- 6. BORDIR BROKAT EMAS & RUMBAI BAWAH (BOTTOM HEM GOLD TRIM) ----
    // Di sepanjang ujung bawah (vUv.y < 0.068), kita gambar pita brokat emas klasik + rumbai
    float trimTopEdge = 0.068;
    float fringeTopEdge = 0.032;

    if (vUv.y < trimTopEdge) {
      float metallicSpec = pow(max(0.0, dot(N, H1)), 24.0) * spotCone1
                         + pow(max(0.0, dot(N, H2)), 16.0) * spotCone2
                         + grazingFresnel * 0.4;

      if (vUv.y >= fringeTopEdge) {
        // Pita Brokat Emas Berukir (Baroque Embroidery Band)
        float bandV = (vUv.y - fringeTopEdge) / (trimTopEdge - fringeTopEdge);
        float patternX = vUv.x * 110.0 + sin(bandV * 6.28318) * 0.6;
        float brocadeWave = sin(patternX * 6.28318) * cos(bandV * 12.566);
        float borderLines = smoothstep(0.18, 0.0, abs(bandV - 0.15)) + smoothstep(0.18, 0.0, abs(bandV - 0.85));
        float goldMask = clamp(smoothstep(-0.2, 0.55, brocadeWave) * 0.75 + borderLines, 0.0, 1.0);

        vec3 goldShade = mix(uGoldShadow, uGoldPrimary, clamp(directLight + 0.35, 0.0, 1.0));
        goldShade = mix(goldShade, uGoldHighlight, clamp(metallicSpec * 0.9, 0.0, 1.0));

        fabricColor = mix(fabricColor * 0.7, goldShade, goldMask * 0.92);
      } else {
        // Rumbai-rumbai benang emas di ujung paling bawah (Gold Bullion Fringe)
        float fringeV = vUv.y / fringeTopEdge; // 0 di ujung bawah, 1 di pangkal pita
        float strandFreq = vUv.x * 380.0 + sin(fringeV * 5.0 + uTime * 2.2) * 0.35;
        float strand = 0.5 + 0.5 * sin(strandFreq * 6.28318);
        float tasselTip = smoothstep(0.0, 0.22 + 0.12 * strand, fringeV);

        if (tasselTip < 0.15) {
          discard;
        }

        vec3 strandGold = mix(uGoldShadow, uGoldPrimary, strand * 0.8 + 0.2);
        strandGold = mix(strandGold, uGoldHighlight, clamp(metallicSpec * strand, 0.0, 1.0));
        strandGold *= mix(0.35, 1.0, foldShadow);
        fabricColor = strandGold;
      }
    }

    // ---- 7. BAYANGAN PELMET ATAS (TOP VALANCE SHADOW CAST) ----
    // Bagian atas tirai yang berada tepat di bawah pelmet menerima bayangan lembut
    float pelmetShadow = smoothstep(0.96, 0.82, vUv.y);
    fabricColor *= mix(0.22, 1.0, pelmetShadow);

    // Vignette teater lembut di sudut paling luar panggung
    float outerCornerVignette = smoothstep(0.0, 0.18, vUv.x);
    fabricColor *= mix(0.55, 1.0, outerCornerVignette);

    // Tone mapping sinematik (ACES-inspired warm curve)
    fabricColor = (fabricColor * (2.51 * fabricColor + 0.03)) / (fabricColor * (2.43 * fabricColor + 0.59) + 0.14);

    gl_FragColor = vec4(clamp(fabricColor, 0.0, 1.0), 1.0);
  }
`;

// ============================================================================
// SHADER 2: PELMET / GRAND VALANCE ATAS BEROMBAK DENGAN RUMBAI EMAS
// ============================================================================

const PELMET_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uStageWidth;
  uniform float uStageHeight;
  uniform float uOpenLift; // Sedikit terangkat anggun saat tirai terbuka

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vScallopY;
  varying float vSwagFold;

  vec3 evaluatePelmet(vec2 uv, out float scallopCurve, out float swagFold) {
    float u = uv.x; // 0..1 dari kiri ke kanan layar
    float v = uv.y; // 0 = ujung rumbai bawah, 1 = batas atas layar

    // 5 gelombang festoon klasik melintang di atas panggung
    float festoonCount = 5.0;
    float festoonPhase = u * festoonCount;
    float localU = fract(festoonPhase) - 0.5; // -0.5 .. +0.5 di tiap lekukan

    // Lekukan festoon (tengah melengkung turun, sambungan antar lekukan naik)
    float arch = 1.0 - 4.0 * localU * localU; // 0 di tepi lekukan, 1 di perut lekukan
    scallopCurve = arch;

    // Lipatan swag radial di dalam masing-masing festoon
    float radialSwag = sin(arch * 16.0 - v * 9.0) * arch * (1.0 - v * 0.5);
    swagFold = radialSwag;

    float width = uStageWidth * 1.06;
    float x = (u - 0.5) * width;

    // Tinggi pelmet: saat tirai terbuka, pelmet sedikit naik agar frame YouTube lega
    float topY = uStageHeight * 0.535;
    float baseDrop = mix(0.21, 0.155, uOpenLift) * uStageHeight;
    float scallopDrop = arch * mix(0.068, 0.048, uOpenLift) * uStageHeight;
    // Sisi paling kiri & kanan sedikit lebih panjang membingkai proscenium
    float wingDrop = pow(abs(u - 0.5) * 2.0, 2.2) * 0.045 * uStageHeight;

    float bottomProfileY = topY - baseDrop - scallopDrop - wingDrop;
    float y = mix(bottomProfileY, topY, v);

    // Kedalaman 3D lekukan pelmet di depan tirai utama (z sekitar +0.55)
    float z = 0.52 + arch * 0.16 * sin(v * 3.14159) + radialSwag * 0.045;
    // Ayunan halus di bagian rumbai bawah pelmet
    z += sin(uTime * 1.6 + u * 9.0) * 0.012 * (1.0 - v);

    return vec3(x, y, z);
  }

  void main() {
    vUv = uv;
    float sc, sf;
    vec3 pos = evaluatePelmet(uv, sc, sf);

    float d1, d2;
    vec3 posU = evaluatePelmet(vec2(clamp(uv.x + 0.003, 0.0, 1.0), uv.y), d1, d2);
    vec3 posV = evaluatePelmet(vec2(uv.x, clamp(uv.y + 0.01, 0.0, 1.0)), d1, d2);

    vec3 n = normalize(cross(posU - pos, posV - pos));
    if (n.z < 0.0) n = -n;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    vScallopY = sc;
    vSwagFold = sf;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const PELMET_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uVelocity;
  uniform vec3 uVelvetShadow;
  uniform vec3 uVelvetBase;
  uniform vec3 uVelvetMid;
  uniform vec3 uVelvetSheen;
  uniform vec3 uGoldPrimary;
  uniform vec3 uGoldHighlight;
  uniform vec3 uGoldShadow;
  uniform vec3 uSpotWarmColor;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vScallopY;
  varying float vSwagFold;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(vec3(0.0, 2.5, 6.0) - vWorldPos);
    vec3 H = normalize(L + V);

    float NdotL = max(0.0, dot(N, L) * 0.7 + 0.3);
    float grazing = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.8);
    float foldCrest = clamp(vSwagFold * 0.5 + 0.5, 0.0, 1.0);

    // Zona Rumbai Emas Gantung (vUv.y < 0.24)
    float fringeLimit = 0.23;
    float brocadeLimit = 0.34;

    if (vUv.y < fringeLimit) {
      float fv = vUv.y / fringeLimit; // 0 di ujung bawah rumbai, 1 di pangkal
      // Ayunan rumbai mengikuti kecepatan gerak tirai + waktu
      float sway = sin(uTime * 2.4 + vUv.x * 35.0) * 0.25 - uVelocity * 0.45 * (1.0 - fv);
      float strandCoord = vUv.x * 460.0 + sway;
      float strandWave = 0.5 + 0.5 * sin(strandCoord * 6.28318);

      // Rumbai Pom-Pom / Tassel lebih panjang secara periodik
      float tasselCluster = 0.5 + 0.5 * cos(vUv.x * 5.0 * 6.28318 * 8.0);
      float minFv = mix(0.08, 0.28, 1.0 - strandWave * (0.7 + 0.3 * tasselCluster));

      if (fv < minFv) {
        discard;
      }

      float spec = pow(max(0.0, dot(N, H)), 20.0) * strandWave;
      vec3 goldCol = mix(uGoldShadow, uGoldPrimary, strandWave * 0.85 + 0.15);
      goldCol = mix(goldCol, uGoldHighlight, clamp(spec + grazing * 0.4, 0.0, 1.0));
      // Bayangan pangkal rumbai
      goldCol *= smoothstep(1.05, 0.75, fv) * 0.3 + 0.7;

      gl_FragColor = vec4(goldCol, 1.0);
      return;
    }

    // Zona Pita Galon Emas Berombak (0.23 <= vUv.y < 0.34)
    if (vUv.y < brocadeLimit) {
      float bv = (vUv.y - fringeLimit) / (brocadeLimit - fringeLimit);
      float emboss = sin(vUv.x * 260.0) * cos(bv * 9.42);
      float spec = pow(max(0.0, dot(N, H)), 28.0) + grazing * 0.35;
      vec3 trimCol = mix(uGoldShadow, uGoldPrimary, clamp(0.55 + 0.45 * emboss, 0.0, 1.0));
      trimCol = mix(trimCol, uGoldHighlight, clamp(spec * 0.85, 0.0, 1.0));
      gl_FragColor = vec4(trimCol, 1.0);
      return;
    }

    // Badan Beludru Pelmet + Medali Rosette Emas di tiap puncak sambungan festoon
    vec3 pelmetVelvet = mix(uVelvetShadow, uVelvetBase, NdotL * (0.45 + 0.55 * foldCrest));
    pelmetVelvet = mix(pelmetVelvet, uVelvetMid, foldCrest * NdotL * 0.65);
    pelmetVelvet += uVelvetSheen * uSpotWarmColor * grazing * foldCrest * 0.45;

    // Ornamen kord emas vertikal di setiap sambungan antar-festoon (5 titik)
    float seamDist = abs(fract(vUv.x * 5.0 + 0.0001) - 0.5);
    float cordMask = smoothstep(0.485, 0.5, seamDist);
    vec3 cordGold = mix(uGoldShadow, uGoldHighlight, 0.6 + 0.4 * sin(vUv.y * 90.0));
    pelmetVelvet = mix(pelmetVelvet, cordGold, cordMask * 0.85);

    // Vignette atas agar menyatu dengan langit-langit proscenium
    float topShadow = smoothstep(1.0, 0.78, vUv.y);
    pelmetVelvet *= mix(0.35, 1.0, topShadow);

    gl_FragColor = vec4(pelmetVelvet, 1.0);
  }
`;

// ============================================================================
// SHADER 3: PARTIKEL DEBU PANGGUNG DI BERKAS CAHAYA (STAGE DUST MOTES)
// ============================================================================

const DUST_VERTEX_SHADER = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;

  uniform float uTime;
  uniform float uStageWidth;
  uniform float uStageHeight;
  uniform float uOpenFactor;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Gerakan melayang lambat di udara panggung
    float t = uTime * 0.28 + aPhase * 6.28318;
    pos.x += sin(t * 1.3 + pos.y) * 0.35;
    pos.y += mod(uTime * 0.09 + aPhase * 4.0, 1.0) * 0.4 - 0.2;
    pos.z += cos(t * 0.9) * 0.2;

    // Skalakan ke ukuran panggung saat ini
    vec3 worldPos = vec3(
      pos.x * uStageWidth * 0.5,
      pos.y * uStageHeight * 0.5,
      pos.z
    );

    // Saat tirai terbuka penuh, partikel di area tengah memudar halus
    // agar tidak mengganggu fokus video YouTube di belakang
    float centerDist = abs(pos.x);
    float videoClearanceMask = mix(1.0, smoothstep(0.25, 0.72, centerDist), uOpenFactor);

    // Berkas lampu sorot atas (lebih terang di paruh atas & tepi lampu)
    float spotlightBeam = smoothstep(-0.6, 0.85, pos.y);
    float twinkle = 0.55 + 0.45 * sin(uTime * 2.4 + aPhase * 25.0);

    vAlpha = videoClearanceMask * spotlightBeam * twinkle * 0.55;

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_PointSize = aScale * uPixelRatio * (18.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DUST_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec3 uSpotWarmColor;
  varying float vAlpha;

  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;

    // Lingkaran bokeh lembut
    float softDisc = pow(1.0 - r, 1.8);
    gl_FragColor = vec4(uSpotWarmColor, softDisc * vAlpha);
  }
`;

// ============================================================================
// SHADER 5: CELAH CAHAYA DRAMATIS SAAT TIRAI MULAI MENYIBAK (SEAM REVEAL)
// ============================================================================

const SEAM_GLOW_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SEAM_GLOW_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float xFalloff = exp(-pow((vUv.x - 0.5) * 7.5, 2.0));
    float yFalloff = sin(vUv.y * 3.14159265);
    float alpha = xFalloff * pow(yFalloff, 0.7) * uIntensity;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.85));
  }
`;

// ============================================================================
// KOMPONEN UTAMA REACT 19 + THREE.JS MURNI
// ============================================================================

export default function Theatrical3DCurtain({
  isOpen,
  onOpenComplete,
  onCloseComplete,
  className = "",
}: Theatrical3DCurtainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simpan state prop & callback terbaru di ref agar loop WebGL tidak pernah re-mount
  const isOpenRef = useRef<boolean>(isOpen);
  const onOpenCompleteRef = useRef<(() => void) | undefined>(onOpenComplete);
  const onCloseCompleteRef = useRef<(() => void) | undefined>(onCloseComplete);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onOpenCompleteRef.current = onOpenComplete;
  }, [onOpenComplete]);

  useEffect(() => {
    onCloseCompleteRef.current = onCloseComplete;
  }, [onCloseComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---- 1. INISIALISASI SCENE, CAMERA, & TRANSPARENT RENDERER ----
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0); // 100% transparan di area tengah saat terbuka
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Daftar resource untuk dibersihkan secara menyeluruh saat unmount
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    // Hitung ukuran panggung dunia (World Units) pada bidang z = 0
    const computeStageDimensions = (aspect: number) => {
      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const height = 2 * Math.tan(vFovRad * 0.5) * camera.position.z;
      const width = height * aspect;
      return { width, height };
    };

    const initialDims = computeStageDimensions(
      (canvas.clientWidth || window.innerWidth) /
        Math.max(canvas.clientHeight || window.innerHeight, 1)
    );

    const initialProgress = isOpenRef.current ? 1.0 : 0.0;

    // ---- 2. SHARED COLOR UNIFORMS ----
    const colors = {
      velvetShadow: new THREE.Color(CURTAIN_CONFIG.velvetDeepShadow),
      velvetBase: new THREE.Color(CURTAIN_CONFIG.velvetBaseColor),
      velvetMid: new THREE.Color(CURTAIN_CONFIG.velvetMidCrimson),
      velvetSheen: new THREE.Color(CURTAIN_CONFIG.velvetSheenColor),
      goldPrimary: new THREE.Color(CURTAIN_CONFIG.goldPrimary),
      goldHighlight: new THREE.Color(CURTAIN_CONFIG.goldHighlight),
      goldShadow: new THREE.Color(CURTAIN_CONFIG.goldShadow),
      spotWarm: new THREE.Color(CURTAIN_CONFIG.spotlightWarmColor),
    };

    // ---- 3. MEMBANGUN PANEL TIRAI KIRI & KANAN (HIGH-DENSITY MESH) ----
    // 220 segmen horizontal x 140 segmen vertikal menghasilkan siluet lipatan sangat mulus
    const curtainGeometry = new THREE.PlaneGeometry(1, 1, 220, 140);
    disposableGeometries.push(curtainGeometry);

    const createCurtainMaterial = (side: -1 | 1) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VELVET_VERTEX_SHADER,
        fragmentShader: VELVET_FRAGMENT_SHADER,
        side: THREE.DoubleSide,
        transparent: false,
        uniforms: {
          uTime: { value: 0 },
          uSide: { value: side },
          uStageWidth: { value: initialDims.width },
          uStageHeight: { value: initialDims.height },
          uTrackOpen: { value: initialProgress },
          uWaistOpen: { value: initialProgress },
          uHemOpen: { value: initialProgress },
          uVelocity: { value: 0 },
          uSettleWave: { value: 0 },
          uPleatCount: { value: CURTAIN_CONFIG.pleatCount },
          uBaseFoldDepth: { value: CURTAIN_CONFIG.baseFoldDepth },
          uGatheredFoldDepth: { value: CURTAIN_CONFIG.gatheredFoldDepth },
          uAirBillow: { value: CURTAIN_CONFIG.airBillowStrength },
          uVelvetShadow: { value: colors.velvetShadow },
          uVelvetBase: { value: colors.velvetBase },
          uVelvetMid: { value: colors.velvetMid },
          uVelvetSheen: { value: colors.velvetSheen },
          uGoldPrimary: { value: colors.goldPrimary },
          uGoldHighlight: { value: colors.goldHighlight },
          uGoldShadow: { value: colors.goldShadow },
          uSpotWarmColor: { value: colors.spotWarm },
          uSpotIntensity: { value: CURTAIN_CONFIG.spotlightIntensity },
          uAmbientIntensity: { value: CURTAIN_CONFIG.ambientIntensity },
          uSeamGlowIntensity: { value: CURTAIN_CONFIG.seamGlowIntensity },
        },
      });
      disposableMaterials.push(mat);
      return mat;
    };

    const leftCurtainMat = createCurtainMaterial(-1);
    const rightCurtainMat = createCurtainMaterial(1);

    const leftCurtainMesh = new THREE.Mesh(curtainGeometry, leftCurtainMat);
    const rightCurtainMesh = new THREE.Mesh(curtainGeometry, rightCurtainMat);
    // Sedikit offset Z (0.015) antara panel kiri & kanan agar tidak Z-fighting di celah tengah
    leftCurtainMesh.position.z = 0.015;
    rightCurtainMesh.position.z = -0.015;
    leftCurtainMesh.frustumCulled = false;
    rightCurtainMesh.frustumCulled = false;

    scene.add(leftCurtainMesh);
    scene.add(rightCurtainMesh);

    // ---- 4. MEMBANGUN PELMET / GRAND VALANCE ATAS ----
    const pelmetGeometry = new THREE.PlaneGeometry(1, 1, 200, 48);
    disposableGeometries.push(pelmetGeometry);

    const pelmetMaterial = new THREE.ShaderMaterial({
      vertexShader: PELMET_VERTEX_SHADER,
      fragmentShader: PELMET_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: false,
      uniforms: {
        uTime: { value: 0 },
        uStageWidth: { value: initialDims.width },
        uStageHeight: { value: initialDims.height },
        uOpenLift: { value: initialProgress },
        uVelocity: { value: 0 },
        uVelvetShadow: { value: colors.velvetShadow },
        uVelvetBase: { value: colors.velvetBase },
        uVelvetMid: { value: colors.velvetMid },
        uVelvetSheen: { value: colors.velvetSheen },
        uGoldPrimary: { value: colors.goldPrimary },
        uGoldHighlight: { value: colors.goldHighlight },
        uGoldShadow: { value: colors.goldShadow },
        uSpotWarmColor: { value: colors.spotWarm },
      },
    });
    disposableMaterials.push(pelmetMaterial);

    const pelmetMesh = new THREE.Mesh(pelmetGeometry, pelmetMaterial);
    pelmetMesh.frustumCulled = false;
    pelmetMesh.renderOrder = 2;
    scene.add(pelmetMesh);

    // ---- 5. CELAH CAHAYA PEMBUKA (CENTER SEAM LIGHT SPILL) ----
    const seamPlaneGeo = new THREE.PlaneGeometry(1.1, 1.0);
    disposableGeometries.push(seamPlaneGeo);

    const seamGlowMat = new THREE.ShaderMaterial({
      vertexShader: SEAM_GLOW_VERTEX_SHADER,
      fragmentShader: SEAM_GLOW_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uIntensity: { value: 0.0 },
        uColor: { value: colors.goldHighlight },
      },
    });
    disposableMaterials.push(seamGlowMat);

    const seamGlowMesh = new THREE.Mesh(seamPlaneGeo, seamGlowMat);
    seamGlowMesh.position.set(0, 0, -0.25);
    scene.add(seamGlowMesh);

    // ---- 7. PARTIKEL DEBU PANGGUNG DI BERKAS CAHAYA (STAGE DUST MOTES) ----
    const dustCount = CURTAIN_CONFIG.dustCount;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustScales = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 1.95; // X normalized
      dustPositions[i * 3 + 1] = (Math.random() - 0.35) * 1.65; // Y normalized (lebih banyak di atas)
      dustPositions[i * 3 + 2] = 0.6 + Math.random() * 2.2; // Z di depan tirai
      dustScales[i] = 0.6 + Math.random() * 1.6;
      dustPhases[i] = Math.random();
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aScale", new THREE.BufferAttribute(dustScales, 1));
    dustGeometry.setAttribute("aPhase", new THREE.BufferAttribute(dustPhases, 1));
    disposableGeometries.push(dustGeometry);

    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX_SHADER,
      fragmentShader: DUST_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uStageWidth: { value: initialDims.width },
        uStageHeight: { value: initialDims.height },
        uOpenFactor: { value: initialProgress },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSpotWarmColor: { value: colors.spotWarm },
      },
    });
    disposableMaterials.push(dustMaterial);

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // ---- 8. SIMULATOR FISIKA PEGAS-REDAMAN (COUPLED SPRING-DAMPER KINEMATICS) ----
    const trackSpring: SpringNode = { pos: initialProgress, vel: 0 };
    const waistSpring: SpringNode = { pos: initialProgress, vel: 0 };
    const hemSpring: SpringNode = { pos: initialProgress, vel: 0 };

    let settleWaveAmp = 0;
    let lastTargetState = isOpenRef.current;
    let completionNotified = true; // Jangan panggil callback saat baru mount pertama kali
    let anticipationTimer = 0;

    let stageDims = initialDims;

    // Fungsi sinkronisasi ukuran canvas & frustum panggung
    const updateSize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      if (width === 0 || height === 0) return;

      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);

      stageDims = computeStageDimensions(aspect);

      leftCurtainMat.uniforms.uStageWidth.value = stageDims.width;
      leftCurtainMat.uniforms.uStageHeight.value = stageDims.height;
      rightCurtainMat.uniforms.uStageWidth.value = stageDims.width;
      rightCurtainMat.uniforms.uStageHeight.value = stageDims.height;

      pelmetMaterial.uniforms.uStageWidth.value = stageDims.width;
      pelmetMaterial.uniforms.uStageHeight.value = stageDims.height;

      dustMaterial.uniforms.uStageWidth.value = stageDims.width;
      dustMaterial.uniforms.uStageHeight.value = stageDims.height;
      dustMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();

      seamGlowMesh.scale.set(stageDims.width * 0.16, stageDims.height * 0.96, 1);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(canvas);
    window.addEventListener("resize", updateSize);

    // ---- 9. ANIMATION LOOP UTAMA ----
    let animationFrameId = 0;
    let prevTime = performance.now() * 0.001;

    const animate = (nowMs: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const now = nowMs * 0.001;
      // Batasi dt maksimum agar simulasi pegas tidak meledak saat tab tidak aktif
      const dt = Math.min(now - prevTime, 0.05);
      prevTime = now;

      const targetOpen = isOpenRef.current;
      const targetVal = targetOpen ? 1.0 : 0.0;

      // Deteksi perubahan perintah buka/tutup
      if (targetOpen !== lastTargetState) {
        lastTargetState = targetOpen;
        completionNotified = false;
        // Beri sedikit jeda antisipasi teatrikal (0.12 detik) disertai getaran kain halus
        anticipationTimer = 0.12;
        settleWaveAmp = Math.max(settleWaveAmp, 0.45);
      }

      if (anticipationTimer > 0) {
        anticipationTimer = Math.max(0, anticipationTimer - dt);
      }

      // Hanya jalankan tarikan utama setelah fase antisipasi singkat selesai
      const effectiveTarget =
        anticipationTimer > 0
          ? waistSpring.pos + (targetVal - waistSpring.pos) * 0.05
          : targetVal;

      const stiffness = targetOpen
        ? CURTAIN_CONFIG.openStiffness
        : CURTAIN_CONFIG.closeStiffness;
      const damping = targetOpen
        ? CURTAIN_CONFIG.openDamping
        : CURTAIN_CONFIG.closeDamping;

      // Sub-stepping untuk stabilitas numerik pegas
      const subSteps = 3;
      const subDt = dt / subSteps;

      for (let s = 0; s < subSteps; s++) {
        // 1. Pegas Pinggang (Tali Pengikat Emas) — memimpin tarikan saat membuka
        const waistK = targetOpen ? stiffness * 1.18 : stiffness * 0.95;
        const waistAccel =
          (effectiveTarget - waistSpring.pos) * waistK * waistK -
          2.0 * damping * waistK * waistSpring.vel;
        waistSpring.vel += waistAccel * subDt;
        waistSpring.pos += waistSpring.vel * subDt;

        // 2. Pegas Rel Atas (Track Carriage) — bergerak anggun dan stabil
        const trackK = stiffness;
        const trackAccel =
          (effectiveTarget - trackSpring.pos) * trackK * trackK -
          2.0 * (damping * 1.05) * trackK * trackSpring.vel;
        trackSpring.vel += trackAccel * subDt;
        trackSpring.pos += trackSpring.vel * subDt;

        // 3. Pegas Ujung Bawah (Weighted Hem) — memiliki inersia tertinggal dan kopel ke pinggang
        const hemTarget =
          effectiveTarget * (1.0 - CURTAIN_CONFIG.hemInertiaLag) +
          waistSpring.pos * CURTAIN_CONFIG.hemInertiaLag;
        const hemK = stiffness * 0.78;
        const hemDamp = damping * 0.76; // Redaman lebih rendah agar ujung bawah mengayun mewah saat berhenti
        const hemAccel =
          (hemTarget - hemSpring.pos) * hemK * hemK -
          2.0 * hemDamp * hemK * hemSpring.vel;
        hemSpring.vel += hemAccel * subDt;
        hemSpring.pos += hemSpring.vel * subDt;
      }

      // Hitung gelombang riak (settle wave) dari perubahan kecepatan dan getaran antisipasi
      const avgVel =
        (waistSpring.vel * 0.45 + trackSpring.vel * 0.25 + hemSpring.vel * 0.3);
      settleWaveAmp = Math.max(
        settleWaveAmp * Math.exp(-dt * 2.4),
        Math.min(Math.abs(avgVel) * 0.85, 1.2)
      );

      // Cek apakah transisi buka/tutup sudah selesai mengendap
      if (!completionNotified) {
        const posError =
          Math.abs(waistSpring.pos - targetVal) +
          Math.abs(trackSpring.pos - targetVal) +
          Math.abs(hemSpring.pos - targetVal);
        const totalSpeed =
          Math.abs(waistSpring.vel) +
          Math.abs(trackSpring.vel) +
          Math.abs(hemSpring.vel);

        if (posError < 0.018 && totalSpeed < 0.035) {
          completionNotified = true;
          if (targetOpen) {
            onOpenCompleteRef.current?.();
          } else {
            onCloseCompleteRef.current?.();
          }
        }
      }

      // ---- 10. UPDATE UNIFORMS TIRAI & PELMET ----
      leftCurtainMat.uniforms.uTime.value = now;
      leftCurtainMat.uniforms.uTrackOpen.value = trackSpring.pos;
      leftCurtainMat.uniforms.uWaistOpen.value = waistSpring.pos;
      leftCurtainMat.uniforms.uHemOpen.value = hemSpring.pos;
      leftCurtainMat.uniforms.uVelocity.value = avgVel;
      leftCurtainMat.uniforms.uSettleWave.value = settleWaveAmp;

      rightCurtainMat.uniforms.uTime.value = now;
      rightCurtainMat.uniforms.uTrackOpen.value = trackSpring.pos;
      rightCurtainMat.uniforms.uWaistOpen.value = waistSpring.pos;
      rightCurtainMat.uniforms.uHemOpen.value = hemSpring.pos;
      rightCurtainMat.uniforms.uVelocity.value = avgVel;
      rightCurtainMat.uniforms.uSettleWave.value = settleWaveAmp;

      pelmetMaterial.uniforms.uTime.value = now;
      pelmetMaterial.uniforms.uOpenLift.value = THREE.MathUtils.clamp(
        waistSpring.pos,
        0,
        1
      );
      pelmetMaterial.uniforms.uVelocity.value = avgVel;

      // Update celah cahaya tengah (menyala dramatis saat baru menyibak 1% - 35%)
      const openClamped = THREE.MathUtils.clamp(waistSpring.pos, 0, 1);
      const seamBurst =
        THREE.MathUtils.smoothstep(openClamped, 0.002, 0.07) *
        (1.0 - THREE.MathUtils.smoothstep(openClamped, 0.12, 0.42));
      seamGlowMat.uniforms.uIntensity.value =
        seamBurst * CURTAIN_CONFIG.seamGlowIntensity;

      // Update partikel debu panggung
      dustMaterial.uniforms.uTime.value = now;
      dustMaterial.uniforms.uOpenFactor.value = openClamped;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ---- 11. CLEANUP RESOURCE MENYELURUH SAAT UNMOUNT ----
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);

      scene.clear();

      for (const geo of disposableGeometries) {
        geo.dispose();
      }
      for (const mat of disposableMaterials) {
        mat.dispose();
      }

      renderer.renderLists.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-[30] ${className}`}
    />
  );
}
