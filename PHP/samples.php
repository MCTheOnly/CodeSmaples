<?php 

// ######
// SAMPLE 1 - WP PLUGIN SETUP
// ######

/**
* @package Touch3D
*/

namespace Inc\Base;

/**
* 
*/

class Activate {
	public static function activate() {

		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$table_name      = $wpdb->prefix . 'touch3d_main';

		// /DEV ENV/ ->
		$wpdb->query( "DROP TABLE IF EXISTS $table_name" );
		// <- /DEV ENV/
	
		$sql = "CREATE TABLE $table_name (
			t3d_option_id mediumint(9) NOT NULL AUTO_INCREMENT,
			t3d_option_name varchar(191) NOT NULL,
			time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			UNIQUE KEY id (t3d_option_id)
		) $charset_collate;";
	
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );

		flush_rewrite_rules();
	}
}

// ######
// SAMPLE 2 - WP PLUGIN SETTINGS ARCHITECTURE
// ######

/**
* @package Touch3D
*/

namespace Inc\Api;

/**
* 
*/

class SettingsApi { 

	public $admin_pages    = array();
	public $admin_subpages = array();

	public function register() {
		if ( ! empty( $this->admin_pages ) ) {
			add_action( 'admin_menu', array( $this, 'addAdminMenu' ) );
		}
	}

	public function addPages( array $pages ) {
		$this->admin_pages = $pages;
		return $this;
	}

	public function withSubpage( string $title = null ) {
		if ( empty( $this->admin_pages ) ) {
			return $this;
		}

		$admin_page = $this->admin_pages[0];

		$subpage = array(
			array(
				'parent_slug' => $admin_page['menu_slug'],
				'page_title'  => $admin_page['page_title'],
				'menu_title'  => ( $title ) ? $title : $admin_page['menu_title'],
				'capability'  => $admin_page['capability'],
				'menu_slug'   => $admin_page['menu_slug'],
				'callback'    => $admin_page['callback']
			)
		);

		$this->admin_subpages = $subpage;

		return $this;
	}

	public function addSubpages( array $pages ) {

		$this->admin_subpages = array_merge( $this->admin_subpages, $pages ) ;

		return $this;
	}

	public function addAdminMenu() {

		foreach ( $this->admin_pages as $page ) {
			add_menu_page( $page['page_title'], $page['menu_title'], $page['capability'], $page['menu_slug'], $page['callback'], $page['icon_url'], $page['position'] );
		}
		foreach ( $this->admin_subpages as $page ) {
			add_submenu_page( $page['parent_slug'], $page['page_title'], $page['menu_title'], $page['capability'], $page['menu_slug'], $page['callback'] );
		}
	}
}

// ######
// SAMPLE 3 - WP PLUGIN INIT
// ######

/**
 * @package Touch3D
 */

namespace Inc;

final class Init {

	/**
	* Stores all classes
	* @return array 			array of classes
	*/

	public static function get_services() {
		return array(
			Pages\Admin::class,
			Base\Enqueue::class,
			Base\SettingsLinks::class
		);
	}

	/**
	* loops through the classes 
	* and calls a register() method
	* @return null
	*/

	public static function register_services() {
		foreach( self::get_services() as $class ) {
			$service = self::instantiate( $class );
			if ( method_exists( $service, 'register' ) ) {
				$service->register();
			}
		}
	}

	/**
	* Initializes the class
	* @param class $class 		class from services array
	* @return class instance 	new instance of the class
	*/
	
	private static function instantiate( $class ) {
		$service = new $class;

		return $service;
	}
}

// ######
// SAMPLE 4 - WP WIDGET
// ######

class Search_Wine extends WP_Widget {
		
	public static $attributes = array();
	public static $products_result = array();

	//setup
	public function __construct() {
		$widget_options = array(
			'classname'   => 'search-wine',
			'description' => 'Custom wine-search widget by Martin Chorzewski WLC',
		);
		parent::__construct( 'wine_searcher', 'Wine Searcher', $widget_options );
	}

	public static function init() {
		self::wc_product_query();
		add_action( 'init', self::register_wine(), 10 );
		add_action( 'init', self::add_styles(), 11 );
		add_action( 'init', self::add_scripts(), 11 );
		wp_localize_script( 'wine-search-script', 'attributesData', self::$attributes );
	}

	public static function add_styles() {
		wp_enqueue_style( 'wine-search-style', get_stylesheet_directory_uri() . '/inc/css/wineCSS.css', array(), null );
	}

	public static function add_scripts() {
		wp_enqueue_script( 'wine-search-script', get_stylesheet_directory_uri() . '/inc/js/wineJS.js', array(), null );
	}

	public static function register_wine() {
		register_widget( 'Search_Wine' );
	}

	//backend
	public function form( $instance ) {
		echo '<p>No options</p>';
	}

	public static function wc_product_query() {

		$products_array = array();

		$args = array(
			'post_type'      => array('baza_win'),
			'post_status'    => 'publish',
			'posts_per_page' => -1,
		);
			
		$query = new WP_Query( $args );

		if ( $query->have_posts() ): while ( $query->have_posts() ):
			$query->the_post();

			global $product;
			
			self::fill_array( $product );

		endwhile;
		wp_reset_postdata();
		endif;
		wp_reset_query();
	}
}
