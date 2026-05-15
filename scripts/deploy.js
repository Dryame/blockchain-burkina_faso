const hre = require("hardhat");

async function main() {
  console.log("Début du déploiement de DiploChain...");

  const DiploChain = await hre.ethers.getContractFactory("DiploChain");
  const diploChain = await DiploChain.deploy();

  await diploChain.waitForDeployment();
  const address = await diploChain.getAddress();

  console.log("DiploChain déployé à l'adresse :", address);

  // --- DONNÉES DE DÉMO ---
  const [owner] = await hre.ethers.getSigners();
  
  console.log("Accréditation de l'Université Ouaga I...");
  const txAccred = await diploChain.addInstitution(owner.address, "Université Ouaga I Pr Joseph Ki-Zerbo");
  await txAccred.wait();

  console.log("Émission des diplômes de test...");

  // Diplôme 1 : Aminata Ouédraogo
  const tx1 = await diploChain.emitDiploma(
    "DIPL-2024-001",
    "Aminata Ouédraogo",
    "12/05/2000",
    "Licence en Informatique",
    "Bien",
    2024,
    "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
  );
  await tx1.wait();
  console.log("Diplôme 1 émis (Aminata Ouédraogo)");

  // Diplôme 2 : Drissa Compaoré
  const tx2 = await diploChain.emitDiploma(
    "DIPL-2023-002",
    "Drissa Compaoré",
    "25/08/1998",
    "Master en Droit Public",
    "Très Bien",
    2023,
    "QmPZ9gcXEMot8WcHvYcxW5UebUnE86k7av4vV8Q946rEcM"
  );
  await tx2.wait();
  console.log("Diplôme 2 émis (Drissa Compaoré)");

  console.log("Déploiement et initialisation terminés !");
  console.log("-----------------------------------------");
  console.log("ADRESSE DU CONTRAT : ", address);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
