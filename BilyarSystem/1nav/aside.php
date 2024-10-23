<?php

$current_page = basename($_SERVER['PHP_SELF']); // Get the current page name

// Check the user role from the session
$userRole = isset($_SESSION['role']) ? $_SESSION['role'] : 'guest'; // Default to 'guest' if not logged in

?>


<nav id="sidebar">
  <ul class="sidebar-nav list-unstyled">
    <!-- Logo -->
    <li class="top">
      <span class="logo">BetterBilliards</span>
      <button onclick="toggleSideBar()" id="toggle-btn">
        <i><span class="logo material-symbols-outlined"> menu </span></i>
      </button>
    </li>
    <!-- Sidebar Items -->
    <li class="<?= $current_page == 'dashboard.php' ? 'active' : '' ?> sidebar-item">
      <a href="/Bilyar4/BilyarSystem/2dashboard/dashboard.php" class="sidebar-link">
        <i><span class="logo material-symbols-outlined">
            grid_view
          </span></i>
        <span class="span">Dashboard</span>
      </a>
    </li>
    <li class="<?= $current_page == 'reservation.php' ? 'active' : '' ?> sidebar-item">
      <a href="/Bilyar4/BilyarSystem/3reservation/reservation.php" class="sidebar-link">
        <i><span class="logo material-symbols-outlined"> event </span></i>
        <span class="span">Table Queueing</span>
      </a>
    </li>
    <li class="<?= $current_page == 'tableManagement.php' ? 'active' : '' ?> sidebar-item">
      <a href="/Bilyar4/BilyarSystem/4tableManagement/tableManagement.php" class="sidebar-link">
        <i><span class="logo material-symbols-outlined">
            table_rows
          </span></i>
        <span class="span">Table Management</span>
      </a>
    </li>
    <li class="<?= $current_page == 'finance.php' ? 'active' : '' ?> sidebar-item">
      <a href="/Bilyar4/BilyarSystem/5finance/finance.php" class="sidebar-link">
        <i><span class="logo material-symbols-outlined">
            analytics
          </span></i>
        <span class="span">Financial Management</span>
      </a>
    </li>

    <?php
    $settingsPages = ['employeeManagement.php', 'registration.php', 'tableSettings.php'];
    ?>

    <li class="sidebar-item">
      <button onclick="toggleSubMenu(this)"
        class="<?= in_array($current_page, $settingsPages) ? 'active' : '' ?> dropdown-btn">
        <i><span class="logo material-symbols-outlined"> settings </span></i>
        <span class="span">Settings</span>
        <i><span class="material-symbols-outlined">
            keyboard_arrow_down
          </span></i>
      </button>
      <ul class="sub-menu">
        <div>
          <li class="<?= $current_page == 'tableSettings.php' ? 'active' : '' ?> sidebar-item"><a
              href="/Bilyar4/BilyarSystem/6settings/subMenu/TableSettings/tableSettings.php">Table Settings</a></li>
          <li class="<?= $current_page == 'employeeManagement.php' ? 'active' : '' ?> sidebar-item"><a
              href="/Bilyar4/BilyarSystem/6settings/subMenu/employeeManagement/employeeManagement.php">Employee
              Management</a></li>
          <li class="<?= $current_page == 'registration.php' ? 'active' : '' ?> sidebar-item"><a
              href="/Bilyar4/BilyarSystem/6settings/subMenu/registration/registration.php">Registration</a></li>
        </div>
      </ul>
    </li>
    <li class="sidebar-item">
      <a href="/Bilyar4/LogIn.html" class="sidebar-link">
        <i><span class="logo material-symbols-outlined"> logout </span></i>
        <span class="span">Log-out</span>
      </a>
    </li>
  </ul>
</nav>